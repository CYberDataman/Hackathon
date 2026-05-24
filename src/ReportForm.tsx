import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function ReportForm() {
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [category, setCategory] = useState('Nuisance')
  const [description, setDescription] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [locating, setLocating] = useState(false)
  const navigate = useNavigate()

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setMessage('Geolocation is not supported in this browser.')
      return
    }

    setLocating(true)
    setMessage('Getting your current location...')

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setCoords({ lat: latitude, lng: longitude })

        try {
          // Call your reverse-geocode API
          const url = `${import.meta.env.VITE_API_URL}/reverse-geocode?lat=${latitude}&lng=${longitude}`
          const res = await fetch(url)
          const data = await res.json()

          if (res.ok && data.address) {
            setLocation(data.address)
            setMessage('')
          } else {
            // Fallback: at least show the coords
            setLocation(`Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}`)
            setMessage('Could not get full address, using coordinates instead.')
          }
        } catch (err) {
          console.error(err)
          setLocation(`Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}`)
          setMessage('Error calling reverse-geocode API, using coordinates instead.')
        } finally {
          setLocating(false)
        }
      },
      (error) => {
        console.error(error)
        setMessage('Unable to get current location.')
        setLocating(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('Submitting...')

    try {
      let photoKey = ''

      if (photo) {
        const urlRes = await fetch(`${import.meta.env.VITE_API_URL}/upload-url`)
        const urlData = await urlRes.json()
        const { uploadUrl, photoKey: key } = typeof urlData.body === 'string'
          ? JSON.parse(urlData.body)
          : urlData

        await fetch(uploadUrl, {
          method: 'PUT',
          body: photo
        })

        photoKey = key
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          location,
          category,
          description,
          photoKey,
          lat: coords?.lat ?? null,
          lng: coords?.lng ?? null,
        }),
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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      {/* Admin Login button */}
      <button
        onClick={() => navigate('/admin')}
        className="fixed top-4 right-4 text-xs text-gray-400 hover:text-gray-600 underline"
      >
        Admin Login
      </button>

      <div className="bg-white rounded-2xl shadow-md w-full max-w-md p-6">
        <h1 className="text-2xl font-bold text-center text-black mb-6">Report an Estate Problem</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
            <input
              type="text" value={name} onChange={e => setName(e.target.value)} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location (e.g. Tampines Avenue 1, Block 67, #01-1234)
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                required
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={locating}
                className="whitespace-nowrap bg-gray-100 hover:bg-gray-200 disabled:bg-gray-200 text-gray-800 text-xs font-medium px-3 py-2 rounded-lg border border-gray-300"
              >
                {locating ? 'Locating...' : 'Use current location'}
              </button>
            </div>

            {coords && (
              <p className="mt-1 text-xs text-gray-500">
                Position: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={category} onChange={e => setCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option>Nuisance</option>
              <option>Safety</option>
              <option>Cleanliness</option>
              <option>Repair</option>
              <option>Assistance</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows={4} value={description} onChange={e => setDescription(e.target.value)} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Photo (optional)</label>
            <input
              type="file" accept="image/*" onChange={e => setPhoto(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-200"
          >
            Submit Report
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm text-gray-600">{message}</p>
        )}
      </div>
    </div>
  )
}

export default ReportForm