/**
 * POST /api/send-message
 * Handles contact form submissions
 * 
 * Supports two methods:
 * 1. Formspree (simple, recommended)
 * 2. Direct SMTP (requires email service setup)
 */

export const prerender = false;

export async function POST({ request }) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    let data;
    
    // Try to parse request body
    try {
      const body = await request.text();
      if (!body) {
        return new Response(
          JSON.stringify({ error: 'Empty request body' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      data = JSON.parse(body);
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { name, email, message } = data;

    // Validate inputs
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get Formspree ID from environment
    const formspreeId = import.meta.env.VITE_FORMSPREE_ID || process.env.VITE_FORMSPREE_ID;
    
    if (formspreeId) {
      return await sendViaFormspree(name, email, message, formspreeId);
    }

    // Fall back to direct SMTP if configured
    const smtpHost = import.meta.env.SMTP_HOST || process.env.SMTP_HOST;
    if (smtpHost) {
      return await sendViaSMTP(name, email, message);
    }

    // If neither is configured, return error with setup instructions
    return new Response(
      JSON.stringify({
        error: 'Email service not configured',
        message: 'Please set up Formspree or SMTP in your environment variables',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-message API:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to send message',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Send message via Formspree
 * Simple and free - no setup required beyond getting a Formspree ID
 */
async function sendViaFormspree(name, email, message, formspreeId) {
  try {
    console.log('Sending via Formspree with ID:', formspreeId);
    
    const response = await fetch(`https://formspree.io/f/${formspreeId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        message,
      }),
    });

    console.log('Formspree response status:', response.status);

    if (response.ok || response.status === 200) {
      return new Response(
        JSON.stringify({ success: true, message: 'Email sent successfully' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      const errorData = await response.text();
      console.error('Formspree error response:', errorData);
      throw new Error(`Formspree request failed with status ${response.status}`);
    }
  } catch (error) {
    console.error('Formspree error:', error);
    throw error;
  }
}

/**
 * Send message via SMTP (Nodemailer)
 * Requires email service configuration
 */
async function sendViaSMTP(name, email, message) {
  try {
    // Check if nodemailer is available
    let nodemailer;
    try {
      nodemailer = await import('nodemailer');
    } catch {
      return new Response(
        JSON.stringify({
          error: 'Email service error',
          message: 'Please install nodemailer: npm install nodemailer',
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const smtpHost = import.meta.env.SMTP_HOST || process.env.SMTP_HOST;
    const smtpPort = import.meta.env.SMTP_PORT || process.env.SMTP_PORT;
    const smtpSecure = (import.meta.env.SMTP_SECURE || process.env.SMTP_SECURE) === 'true';
    const smtpUser = import.meta.env.SMTP_USER || process.env.SMTP_USER;
    const smtpPassword = import.meta.env.SMTP_PASSWORD || process.env.SMTP_PASSWORD;
    const smtpFromEmail = import.meta.env.SMTP_FROM_EMAIL || process.env.SMTP_FROM_EMAIL;
    const adminEmail = import.meta.env.ADMIN_EMAIL || process.env.ADMIN_EMAIL || 'delosreyesjulieanne199@gmail.com';

    const transporter = nodemailer.default.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort || '587'),
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });

    // Email to admin
    await transporter.sendMail({
      from: smtpFromEmail,
      to: adminEmail,
      subject: `New Message from ${name} - Portfolio Contact`,
      html: generateAdminEmail(name, email, message),
      replyTo: email,
    });

    // Confirmation email to user
    await transporter.sendMail({
      from: smtpFromEmail,
      to: email,
      subject: 'Thank you for contacting us',
      html: generateUserConfirmationEmail(name),
    });

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('SMTP error:', error);
    throw error;
  }
}

/**
 * Generate HTML for admin email
 */
function generateAdminEmail(name, email, message) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3b82f6;">New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
      <h3 style="color: #1e40af; margin-top: 20px;">Message:</h3>
      <p style="white-space: pre-wrap; background-color: #f3f4f6; padding: 15px; border-radius: 8px;">
        ${escapeHtml(message)}
      </p>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 12px;">
        This message was sent from your portfolio contact form.
      </p>
    </div>
  `;
}

/**
 * Generate HTML for user confirmation email
 */
function generateUserConfirmationEmail(name) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3b82f6;">Thank you, ${escapeHtml(name)}!</h2>
      <p>We've received your message and appreciate you reaching out to us.</p>
      <p>Our team will review your inquiry and get back to you as soon as possible, typically within 24 hours.</p>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 12px;">
        If you have any urgent matters, feel free to contact us directly at:
      </p>
      <p style="color: #3b82f6;">
        <a href="mailto:delosreyesjulieanne199@gmail.com">delosreyesjulieanne199@gmail.com</a>
      </p>
    </div>
  `;
}

/**
 * Escape HTML to prevent injection
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

