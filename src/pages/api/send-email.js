export const prerender = false;

// Postmark API key should be set in Cloudflare Worker environment variables

export async function POST({ request, env }) {
  try {
    // Debug environment variables
    console.log('Environment object available:', !!env);
    console.log('Environment keys:', env ? Object.keys(env) : 'No env object');
    
    // Get API key from environment variables
    // Since the env object is not available, we need a different approach
    let POSTMARK_API_KEY;
    
    // Try different ways to access environment variables
    try {
      // Try to access from env object
      if (env && typeof env.POSTMARK_API_KEY !== 'undefined') {
        POSTMARK_API_KEY = env.POSTMARK_API_KEY;
        console.log('Got API key from env object');
      } 
      // Try to access from process.env (Node.js environment)
      else if (typeof process !== 'undefined' && process.env && process.env.POSTMARK_API_KEY) {
        POSTMARK_API_KEY = process.env.POSTMARK_API_KEY;
        console.log('Got API key from process.env');
      }
      // Try to access from global scope (Cloudflare Worker)
      else if (typeof POSTMARK_API_KEY !== 'undefined') {
        console.log('Got API key from global scope');
      }
      else {
        console.log('Could not find API key in any environment');
      }
    } catch (e) {
      console.error('Error accessing environment variables:', e);
    }
    
    // Additional debugging for Cloudflare Worker environment
    console.log('Worker environment check:', {
      hasEnv: !!env,
      hasPostmarkKey: !!POSTMARK_API_KEY,
      isRunningInWorker: typeof globalThis.WorkerGlobalScope !== 'undefined'
    });
    
    if (!POSTMARK_API_KEY) {
      console.error('Postmark API key is not set');
      throw new Error('API key not configured - please check environment variables');
    }
    const TO_EMAIL = '5358207@gmail.com'; // Email to receive messages

    const data = await request.json();
    const { name, email, subject, message } = data;

    // Add CORS headers for preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }

    // Log that we're sending an email (without exposing the API key)
    console.log('Sending email with Postmark API...');
    
    const response = await fetch('https://api.postmarkapp.com/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Postmark-Server-Token': POSTMARK_API_KEY
      },
      body: JSON.stringify({
        From: 'info@denmelnychuk.com', // Verified sender email
        To: TO_EMAIL,
        Subject: `Contact Form: ${subject}`,
        TextBody: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        HtmlBody: `
          <h3>New Contact Form Submission</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
        `
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Postmark API error:', errorData);
      throw new Error(`Failed to send email: ${errorData.Message || 'Unknown error'}`);
    }

    const responseData = await response.json();
    console.log('Email sent successfully:', responseData);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('Error in send-email endpoint:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
