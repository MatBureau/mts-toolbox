'use client'

import { useState } from 'react'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Textarea from '@/components/ui/Textarea'
import CopyButton from '@/components/ui/CopyButton'

export default function ConvertisseurImageBase64() {
  const [image, setImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [base64, setBase64] = useState<string>('')

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setPreviewUrl(result)
        setBase64(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const getFileSize = () => {
    if (!base64) return '0 KB'
    const sizeInBytes = (base64.length * 3) / 4
    return (sizeInBytes / 1024).toFixed(2) + ' KB'
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Télécharger une image</CardTitle>
        </CardHeader>
        <CardContent>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
          />
        </CardContent>
      </Card>

      {previewUrl && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Aperçu</CardTitle>
            </CardHeader>
            <CardContent>
              <img src={previewUrl} alt="Preview" className="max-w-full h-auto rounded-lg" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Taille: {getFileSize()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Base64</CardTitle>
                <CopyButton text={base64} />
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={base64}
                readOnly
                rows={10}
                className="font-mono text-xs"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>HTML IMG Tag</CardTitle>
                <CopyButton text={`<img src="${base64}" alt="Image" />`} />
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={`<img src="${base64}" alt="Image" />`}
                readOnly
                rows={3}
                className="font-mono text-xs"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>CSS Background</CardTitle>
                <CopyButton text={`background-image: url('${base64}');`} />
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={`background-image: url('${base64}');`}
                readOnly
                rows={2}
                className="font-mono text-xs"
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
