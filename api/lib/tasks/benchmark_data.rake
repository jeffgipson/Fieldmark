# frozen_string_literal: true

namespace :benchmarks do
  desc "Scrape Extension budgets, validate, and write to db/seeds/benchmark_data.json"
  task scrape: :environment do
    # Known good, pre-extracted data
    baseline_path = Rails.root.join("db", "seeds", "benchmark_data.json")
    records = JSON.parse(File.read(baseline_path))

    # URLs to scrape for irrigated budgets
    urls_to_scrape = {
      "g00652" => "https://extension.missouri.edu/media/wysiwyg/Extensiondata/Pub/pdf/agguides/agecon/g00652.pdf",
      "g00659" => "https://extension.missouri.edu/media/wysiwyg/Extensiondata/Pub/pdf/agguides/agecon/g00659.pdf"
    }

    puts "Scraping #{urls_to_scrape.size} new PDF(s)..."
    urls_to_scrape.each do |pub_id, url|
      begin
        data = BenchmarkData::PdfParser.call(url)
        # This is a simplification; a real implementation would merge this data
        # into a new record structure. For now, we print it.
        puts "Scraped #{pub_id}:"
        puts JSON.pretty_generate(data)
      rescue => e
        puts "Error scraping #{url}: #{e.message}"
      end
    end

    puts "Scraping publication index..."
    catalog = BenchmarkData::IndexScraper.call
    catalog_path = Rails.root.join("db", "seeds", "publication_catalog.json")
    File.write(catalog_path, JSON.pretty_generate(catalog))
    puts "Wrote #{catalog.size} publications to #{catalog_path}"
  
    puts "Validating all records..."
    all_valid = true
    records.each do |record|
      errors = BenchmarkData::Validator.call(record)
      unless errors.empty?
        puts "Invalid record found for #{record["source"]}: #{errors.join(", ")}"
        all_valid = false
      end
    end

    if all_valid
      File.write(baseline_path, JSON.pretty_generate(records))
      puts "All #{records.size} benchmark records are valid. Written to #{baseline_path}."
    else
      puts "Validation failed. Not overwriting benchmark data."
    end
  end

  desc "Fetch USDA NASS yield data"
  task nass: :environment do
    BenchmarkData::NassYieldFetcher.call
  end
end
