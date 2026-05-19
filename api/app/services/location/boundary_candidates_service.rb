# frozen_string_literal: true

module Location
  class BoundaryCandidatesService
    LARGE_VIEWPORT_DEGREES = 0.08
    POINT_SEARCH_RADIUS_M = 800

    Result = Struct.new(:candidates, :diagnostics, keyword_init: true)

    def self.call(latitude: nil, longitude: nil, south: nil, west: nil, north: nil, east: nil)
      call_with_diagnostics(
        latitude: latitude,
        longitude: longitude,
        south: south,
        west: west,
        north: north,
        east: east
      ).candidates
    end

    def self.call_with_diagnostics(latitude: nil, longitude: nil, south: nil, west: nil, north: nil, east: nil)
      if south.present? && west.present? && north.present? && east.present?
        bbox_candidates(south, west, north, east, latitude: latitude, longitude: longitude)
      elsif latitude.present? && longitude.present?
        point_candidates(latitude, longitude)
      else
        Result.new(candidates: [], diagnostics: empty_diagnostics)
      end
    end

    def self.point_candidates(latitude, longitude)
      lat = latitude.to_f
      lng = longitude.to_f

      regrid = RegridBoundaryFetcher.call(latitude: lat, longitude: lng, radius_m: 200)
      if regrid.size.positive? && AppConfig.regrid_api_key.present?
        return build_result(regrid, [])
      end

      osm = OsmBoundaryFetcher.call(latitude: lat, longitude: lng, radius_m: POINT_SEARCH_RADIUS_M)

      build_result(regrid, osm)
    end

    def self.bbox_candidates(south, west, north, east, latitude: nil, longitude: nil)
      south = south.to_f
      west = west.to_f
      north = north.to_f
      east = east.to_f
      center_lat = latitude.present? ? latitude.to_f : (south + north) / 2.0
      center_lng = longitude.present? ? longitude.to_f : (west + east) / 2.0

      regrid = RegridBoundaryFetcher.call(
        latitude: center_lat,
        longitude: center_lng,
        radius_m: bbox_regrid_radius_m(south, west, north, east)
      )

      # Regrid is the primary source when configured — skip slow Overpass calls if we already have parcels.
      return build_result(regrid, []) if regrid.size.positive? && AppConfig.regrid_api_key.present?

      osm = if large_viewport?(south, west, north, east)
              OsmBoundaryFetcher.call(
                latitude: center_lat,
                longitude: center_lng,
                radius_m: POINT_SEARCH_RADIUS_M
              )
            else
              OsmBoundaryFetcher.call_bbox(
                south: south,
                west: west,
                north: north,
                east: east,
                latitude: center_lat,
                longitude: center_lng
              )
            end

      if osm.size < 3 && !large_viewport?(south, west, north, east)
        osm += OsmBoundaryFetcher.call(
          latitude: center_lat,
          longitude: center_lng,
          radius_m: POINT_SEARCH_RADIUS_M
        )
      end

      build_result(regrid, osm)
    end

    def self.build_result(regrid_list, osm_list)
      regrid_configured = AppConfig.regrid_api_key.present?
      Result.new(
        candidates: merge_candidates(regrid_list + osm_list),
        diagnostics: {
          openstreetmap_count: osm_list.size,
          regrid_count: regrid_list.size,
          regrid_configured: regrid_configured,
          regrid_trial_note: regrid_trial_note(regrid_list.size, regrid_configured)
        }
      )
    end

    def self.empty_diagnostics
      regrid_configured = AppConfig.regrid_api_key.present?
      {
        openstreetmap_count: 0,
        regrid_count: 0,
        regrid_configured: regrid_configured,
        regrid_trial_note: regrid_trial_note(0, regrid_configured)
      }
    end

    def self.regrid_trial_note(regrid_count, configured)
      return nil unless configured && regrid_count.zero?

      "Regrid trial tokens only include parcels in Regrid's demo counties (e.g. Dallas TX). " \
        "Missouri farmland is not in the trial set — use Mark field, or upgrade for MO coverage."
    end

    def self.large_viewport?(south, west, north, east)
      (north - south).abs > LARGE_VIEWPORT_DEGREES || (east - west).abs > LARGE_VIEWPORT_DEGREES
    end

    # Regrid point search is center + radius — cover the visible map box, not just 75 m.
    def self.bbox_regrid_radius_m(south, west, north, east)
      center_lat = (south.to_f + north.to_f) / 2.0
      lat_m = ((north.to_f - south.to_f).abs * 111_000) / 2.0
      lng_m = ((east.to_f - west.to_f).abs * 111_000 * Math.cos(center_lat * Math::PI / 180)) / 2.0
      half_diag = Math.sqrt((lat_m**2) + (lng_m**2))
      half_diag.clamp(75, 1_200).to_i
    end

    def self.merge_candidates(list)
      seen = {}
      list.filter_map do |item|
        key = item.boundary.to_json
        next if seen[key]

        seen[key] = true
        serialize(item)
      end
    end

    def self.serialize(candidate)
      {
        id: candidate.id,
        source: candidate.source,
        label: candidate.label,
        acres: candidate.acres,
        distance_m: candidate.distance_m,
        contains_point: candidate.contains_point,
        boundary: candidate.boundary
      }
    end

    private_class_method :merge_candidates, :serialize, :point_candidates, :bbox_candidates,
                         :large_viewport?, :bbox_regrid_radius_m, :build_result, :empty_diagnostics
  end
end
