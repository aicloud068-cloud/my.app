import { Hono } from "hono";
import { cors } from "hono/cors";
import { createClient } from "@supabase/supabase-js";

const app = new Hono<{ Bindings: Env }>();

app.use("/*", cors());

// API endpoint to upload order to Supabase
app.post("/api/orders", async (c) => {
  try {
    const { customerName, phoneNumber, excelFile } = await c.req.json();

    if (!customerName || !phoneNumber || !excelFile) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    // Decode base64 Excel file
    const fileBuffer = Uint8Array.from(atob(excelFile), char => char.charCodeAt(0));
    
    // Generate unique filename
    const timestamp = Date.now();
    const filename = `orders/${timestamp}_${customerName.replace(/\s+/g, '_')}.xlsx`;

    // Upload to R2
    await c.env.R2_BUCKET.put(filename, fileBuffer, {
      httpMetadata: {
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });

    // Generate public URL for the file
    const excelUrl = `/api/files/${encodeURIComponent(filename)}`;

    // Check if Supabase credentials are available
    if (!c.env.SUPABASE_URL || !c.env.SUPABASE_ANON_KEY) {
      console.error('Supabase credentials missing:', {
        hasUrl: !!c.env.SUPABASE_URL,
        hasKey: !!c.env.SUPABASE_ANON_KEY
      });
      return c.json({ 
        error: 'Supabase credentials not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY secrets.',
        details: 'يرجى التواصل مع المطور لإعداد الأسرار المطلوبة'
      }, 500);
    }

    // Initialize Supabase client
    const supabase = createClient(
      c.env.SUPABASE_URL,
      c.env.SUPABASE_ANON_KEY
    );

    // Insert order into Supabase
    const { data, error } = await supabase
      .from('orders')
      .insert([
        {
          customer_name: customerName,
          phone: phoneNumber,
          exel_url: excelUrl,
        }
      ])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return c.json({ 
        error: 'Failed to save order to database', 
        details: error.message 
      }, 500);
    }

    return c.json({ 
      success: true, 
      order: data?.[0],
      message: 'تم حفظ الطلب بنجاح'
    });

  } catch (error) {
    console.error('Error creating order:', error);
    return c.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// API endpoint to download files from R2
app.get("/api/files/:filename", async (c) => {
  try {
    const filename = decodeURIComponent(c.req.param("filename"));
    const object = await c.env.R2_BUCKET.get(filename);
    
    if (!object) {
      return c.json({ error: "File not found" }, 404);
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    
    return c.body(object.body, { headers });
  } catch (error) {
    console.error('Error downloading file:', error);
    return c.json({ error: 'Failed to download file' }, 500);
  }
});

export default app;
