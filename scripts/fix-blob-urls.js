// Script to fix blob URLs in campaign_items table
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://kljyabbkgufeysuuudpu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsanlhYmJrZ3VmZXlzdXV1ZHB1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzA1Nzg0NiwiZXhwIjoyMDcyNjMzODQ2fQ._qXtjYUxlltGNRbBKxWz-Gi65c4D7kDYJSWe5Vo8_O4' // Using service role key

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixBlobUrls() {
  console.log('Finding campaign items with blob URLs...\n')

  // Fetch all items
  const { data: items, error } = await supabase
    .from('campaign_items')
    .select('id, name, image_url')

  if (error) {
    console.error('Error fetching items:', error)
    return
  }

  // Find items with blob URLs
  const blobItems = items.filter(item => item.image_url && item.image_url.includes('blob:'))

  console.log(`Found ${blobItems.length} items with blob URLs:\n`)

  if (blobItems.length === 0) {
    console.log('✅ No blob URLs found! All items are good.')
    return
  }

  blobItems.forEach(item => {
    console.log(`  - ${item.name} (ID: ${item.id})`)
    console.log(`    Current URL: ${item.image_url}`)
  })

  console.log('\nFixing blob URLs by setting them to null...\n')

  let fixedCount = 0
  let errorCount = 0

  for (const item of blobItems) {
    const { error: updateError } = await supabase
      .from('campaign_items')
      .update({ image_url: null })
      .eq('id', item.id)

    if (updateError) {
      console.error(`❌ Error fixing ${item.name}:`, updateError)
      errorCount++
    } else {
      console.log(`✅ Fixed: ${item.name}`)
      fixedCount++
    }
  }

  console.log(`\n✅ Fixed ${fixedCount} items`)
  if (errorCount > 0) {
    console.log(`❌ ${errorCount} errors occurred`)
  }
  console.log('\n🎉 Done! You can now re-upload images for these items.')
}

fixBlobUrls()
