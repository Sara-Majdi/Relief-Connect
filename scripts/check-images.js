// Quick script to check campaign images in database
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://kljyabbkgufeysuuudpu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsanlhYmJrZ3VmZXlzdXV1ZHB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNTc4NDYsImV4cCI6MjA3MjYzMzg0Nn0.-hdDh4y7ycKFCuoK3JYqtWeb7GwiR97a-kUzLNq_azs'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkImages() {
  console.log('Checking campaigns and their images...\n')

  const { data: campaigns, error } = await supabase
    .from('campaigns')
    .select('id, title, image_url')
    .limit(10)

  if (error) {
    console.error('Error fetching campaigns:', error)
    return
  }

  console.log(`Found ${campaigns.length} campaigns:\n`)

  campaigns.forEach((campaign, index) => {
    console.log(`${index + 1}. ${campaign.title}`)
    console.log(`   ID: ${campaign.id}`)
    console.log(`   Image URL: ${campaign.image_url || 'NO IMAGE'}`)

    // Check if it's a blob URL
    if (campaign.image_url && campaign.image_url.includes('blob:')) {
      console.log('   ⚠️  WARNING: This is a BLOB URL (temporary preview) - it should be a real URL!')
    }
    console.log('')
  })

  // Check storage buckets
  const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()

  if (!bucketError) {
    console.log('Available storage buckets:')
    buckets.forEach(bucket => {
      console.log(`  - ${bucket.name} (public: ${bucket.public})`)
    })
  }
}

checkImages()
