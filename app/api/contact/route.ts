import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/lib/env'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, message } = body

    // Validation basique
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Tous les champs sont requis' }, { status: 400 })
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
    }

    // ===== OPTION 1: Resend (recommandé) =====
    // Décommentez si vous utilisez Resend
    /*
    const { Resend } = require('resend')
    const resend = new Resend(env.EMAIL_API_KEY)

    await resend.emails.send({
      from: env.EMAIL_FROM,
      to: env.EMAIL_TO,
      subject: `[MTS-Toolbox] Message de ${name}`,
      html: `
        <h2>Nouveau message de contact</h2>
        <p><strong>Nom:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    })
    */

    // ===== OPTION 2: SendGrid =====
    // Décommentez si vous utilisez SendGrid
    /*
    const sgMail = require('@sendgrid/mail')
    sgMail.setApiKey(env.EMAIL_API_KEY)

    await sgMail.send({
      to: env.EMAIL_TO,
      from: env.EMAIL_FROM,
      subject: `[MTS-Toolbox] Message de ${name}`,
      html: `
        <h2>Nouveau message de contact</h2>
        <p><strong>Nom:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    })
    */

    // ===== OPTION 3: Nodemailer (pour SMTP custom) =====
    // Décommentez si vous utilisez Nodemailer
    /*
    const nodemailer = require('nodemailer')
    const transporter = nodemailer.createTransport({
      host: 'smtp.example.com',
      port: 587,
      secure: false,
      auth: {
        user: 'your-email@example.com',
        pass: env.EMAIL_API_KEY,
      },
    })

    await transporter.sendMail({
      from: env.EMAIL_FROM,
      to: env.EMAIL_TO,
      subject: `[MTS-Toolbox] Message de ${name}`,
      html: `
        <h2>Nouveau message de contact</h2>
        <p><strong>Nom:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    })
    */

    // Mode développement : Log le message
    if (!env.EMAIL_API_KEY) {
      console.log('=== NOUVEAU MESSAGE DE CONTACT ===')
      console.log(`Nom: ${name}`)
      console.log(`Email: ${email}`)
      console.log(`Message: ${message}`)
      console.log('===================================')
    }

    return NextResponse.json({
      success: true,
      message: 'Message envoyé avec succès',
    })
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi du message' },
      { status: 500 }
    )
  }
}
