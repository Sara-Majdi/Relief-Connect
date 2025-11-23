'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Copy, Check, Facebook, Twitter, Linkedin, Mail, MessageCircle } from 'lucide-react'

export default function ShareCampaignModal({ isOpen, onClose, campaign }) {
  const [copied, setCopied] = useState(false)
  const [emailForm, setEmailForm] = useState({ to: '', message: '' })
  const [emailSending, setEmailSending] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  // Generate campaign URL
  const campaignUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/campaigns/${campaign?.id}`
    : ''

  // Copy to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(campaignUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // Share to social media
  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(campaignUrl)}`
    window.open(url, '_blank', 'width=600,height=400')
  }

  const shareToTwitter = () => {
    const text = `Help support: ${campaign?.title || 'this campaign'}`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(campaignUrl)}`
    window.open(url, '_blank', 'width=600,height=400')
  }

  const shareToLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(campaignUrl)}`
    window.open(url, '_blank', 'width=600,height=400')
  }

  const shareToWhatsApp = () => {
    const text = `Help support: ${campaign?.title || 'this campaign'} - ${campaignUrl}`
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  // Send email
  const handleSendEmail = async (e) => {
    e.preventDefault()
    setEmailSending(true)

    try {
      const response = await fetch('/api/share-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailForm.to,
          message: emailForm.message,
          campaignTitle: campaign?.title,
          campaignUrl: campaignUrl,
          campaignDescription: campaign?.description
        })
      })

      if (response.ok) {
        setEmailSent(true)
        setEmailForm({ to: '', message: '' })
        setTimeout(() => setEmailSent(false), 3000)
      } else {
        alert('Failed to send email. Please try again.')
      }
    } catch (error) {
      console.error('Error sending email:', error)
      alert('Failed to send email. Please try again.')
    } finally {
      setEmailSending(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>Share Campaign</DialogTitle>
          <DialogDescription>
            Help spread the word about this campaign
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Copy Link Section */}
          <div className="space-y-2">
            <Label>Campaign Link</Label>
            <div className="flex gap-2">
              <Input
                value={campaignUrl}
                readOnly
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={copyToClipboard}
                className="shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Social Media Share Buttons */}
          <div className="space-y-2">
            <Label>Share on Social Media</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={shareToFacebook}
                className="justify-start"
              >
                <Facebook className="h-4 w-4 mr-2 text-blue-600" />
                Facebook
              </Button>
              <Button
                variant="outline"
                onClick={shareToTwitter}
                className="justify-start"
              >
                <Twitter className="h-4 w-4 mr-2 text-sky-500" />
                Twitter
              </Button>
              <Button
                variant="outline"
                onClick={shareToLinkedIn}
                className="justify-start"
              >
                <Linkedin className="h-4 w-4 mr-2 text-blue-700" />
                LinkedIn
              </Button>
              <Button
                variant="outline"
                onClick={shareToWhatsApp}
                className="justify-start"
              >
                <MessageCircle className="h-4 w-4 mr-2 text-green-600" />
                WhatsApp
              </Button>
            </div>
          </div>

          {/* Email Share Section */}
          <div className="space-y-2">
            <Label>Share via Email</Label>
            <form onSubmit={handleSendEmail} className="space-y-3">
              <div>
                <Input
                  type="email"
                  placeholder="Friend's email address"
                  value={emailForm.to}
                  onChange={(e) => setEmailForm({ ...emailForm, to: e.target.value })}
                  required
                />
              </div>
              <div>
                <Textarea
                  placeholder="Add a personal message (optional)"
                  value={emailForm.message}
                  onChange={(e) => setEmailForm({ ...emailForm, message: e.target.value })}
                  rows={3}
                  className="resize-none"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={emailSending || !emailForm.to}
              >
                <Mail className="h-4 w-4 mr-2" />
                {emailSending ? 'Sending...' : emailSent ? 'Sent!' : 'Send Email'}
              </Button>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
