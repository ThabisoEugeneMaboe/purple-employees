import { Check, Share2 } from 'lucide-react'
import { useState } from 'react'

function ShareRequestButton({
  reference,
  label = 'Share this confirmation',
}: {
  reference: string
  label?: string
}) {
  const [status, setStatus] = useState('')

  async function handleShare() {
    const url = window.location.href
    const title = `PURPLE request ${reference}`
    const text = `PURPLE support request received. Reference: ${reference}`

    try {
      if (navigator.share) {
        await navigator.share({ title, text, url })
        setStatus('Opened your share options.')
        return
      }

      await navigator.clipboard.writeText(`${text}\n${url}`)
      setStatus('Link copied. You can paste it to yourself or anyone you trust.')
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return
      }

      try {
        await navigator.clipboard.writeText(`${text}\n${url}`)
        setStatus('Link copied. You can paste it to yourself or anyone you trust.')
      } catch {
        setStatus('Sharing is not available in this browser.')
      }
    }
  }

  return (
    <div className="share-request-actions">
      <button
        type="button"
        className="share-request-button"
        onClick={handleShare}
      >
        {status.startsWith('Link copied') || status.startsWith('Opened') ? (
          <Check size={16} />
        ) : (
          <Share2 size={16} />
        )}
        {label}
      </button>
      {status && (
        <p className="share-request-status" role="status">
          {status}
        </p>
      )}
    </div>
  )
}

export default ShareRequestButton
