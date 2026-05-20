import { useState } from 'react'

function ReportForm() {
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [category, setCategory] = useState('Nuisance')
  const [description, setDescription] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('Submitting...')

    try {
        let photoKey = ''

        if (photo) {
        // Step 1: Get presigned URL
        const urlRes = await fetch(`${import.meta.env.VITE_API_URL}/upload-url`)
        const urlData = await urlRes.json()
        console.log('URL DATA:', JSON.stringify(urlData))
        const { uploadUrl, photoKey: key } = typeof urlData.body === 'string'
            ? JSON.parse(urlData.body)
            : urlData

        // Step 2: Upload photo directly to S3
        await fetch(uploadUrl, {
            method: 'PUT',
            body: photo
        })

        photoKey = key
        }

        // Step 3: Submit report with photoKey
        const response = await fetch(`${import.meta.env.VITE_API_URL}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, location, category, description, photoKey })
        })

        const raw = await response.json()
        const data = typeof raw.body === 'string' ? JSON.parse(raw.body) : raw
        setMessage('Report submitted successfully! ID: ' + data.reportId)
    } catch (error) {
        setMessage('Something went wrong. Please try again.')
        console.error(error)
    }
    }

  return (
    <div>
      <h1>Report an Estate Problem</h1>
      <form onSubmit={handleSubmit}>

        <label>Your Name:<br />
          <input type="text" value={name} onChange={e => setName(e.target.value)} required />
        </label><br /><br />

        <label>Location (e.g. Block 12, Level 3):<br />
          <input type="text" value={location} onChange={e => setLocation(e.target.value)} required />
        </label><br /><br />

        <label>Category:<br />
          <select value={category} onChange={e => setCategory(e.target.value)}>
            <option>Nuisance</option>
            <option>Safety</option>
            <option>Cleanliness</option>
            <option>Repair</option>
            <option>Assistance</option>
          </select>
        </label><br /><br />

        <label>Description:<br />
          <textarea rows={4} value={description} onChange={e => setDescription(e.target.value)} required />
        </label><br /><br />

        <label>Photo:<br />
          <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files?.[0] || null)} />
        </label><br /><br />

        <button type="submit">Submit Report</button>
      </form>
      <p>{message}</p>
    </div>
  )
}

export default ReportForm