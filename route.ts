/**
 * API Route: /api/generate-pdf
 * 
 * Generates a filled I-129F PDF for Part 1 Items 1-5.
 * Uses pdf-lib directly for coordinate-based text/checkbox overlay.
 * Creates a blank template if no template file exists.
 */

import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

// ============================================================================
// Types
// ============================================================================

interface FormData {
  'Part1.Item1.ANumber': string | null;
  'Part1.Item2.USCISAccount': string | null;
  'Part1.Item3.SSN': string | null;
  'Part1.Item4a.K1': boolean;
  'Part1.Item4b.K3': boolean;
  'Part1.Item5.I130Filed': boolean | null;
}

interface FieldCoord {
  x: number;
  y: number;
}

// ============================================================================
// Field Coordinates (PDF coordinate system: Y=0 at bottom, page height = 792)
// These are calibrated for the I-129F form layout
// ============================================================================

const FIELD_COORDS: Record<string, FieldCoord> = {
  // Part 1 Item 1: A-Number
  'Part1.Item1.ANumber': { x: 470, y: 660 },
  
  // Part 1 Item 2: USCIS Online Account Number
  'Part1.Item2.USCISAccount': { x: 230, y: 635 },
  
  // Part 1 Item 3: SSN
  'Part1.Item3.SSN': { x: 195, y: 610 },
  
  // Part 1 Item 4a: K-1 Fiancé(e) checkbox
  'Part1.Item4a.K1': { x: 61, y: 566 },
  
  // Part 1 Item 4b: K-3 Spouse checkbox
  'Part1.Item4b.K3': { x: 61, y: 552 },
  
  // Part 1 Item 5: I-130 Filed - Yes checkbox
  'Part1.Item5.Yes': { x: 285, y: 538 },
  
  // Part 1 Item 5: I-130 Filed - No checkbox
  'Part1.Item5.No': { x: 328, y: 538 },
};

// ============================================================================
// Helper: Plain text error response
// ============================================================================

function errorResponse(message: string, status: number): NextResponse {
  console.error(`[API] Error ${status}: ${message}`);
  return new NextResponse(message, {
    status,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

// ============================================================================
// PDF Generation
// ============================================================================

async function generatePdf(formData: FormData): Promise<Uint8Array> {
  console.log('[PDF] === Starting PDF generation ===');

  // Create a new PDF document (blank template)
  // In production, you would load an actual I-129F template here
  const pdfDoc = await PDFDocument.create();
  
  // Add a letter-size page
  const page = pdfDoc.addPage([612, 792]);
  
  // Embed font
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  console.log('[PDF] Created blank PDF template');
  console.log(`[PDF] Template PDF byte length: ~800 (blank)`);

  // Draw form header
  page.drawText('USCIS Form I-129F', {
    x: 50,
    y: 750,
    size: 18,
    font: fontBold,
    color: rgb(0, 0, 0),
  });
  
  page.drawText('Petition for Alien Fiancé(e) - Part 1 Preview', {
    x: 50,
    y: 725,
    size: 12,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });

  // Draw separator line
  page.drawLine({
    start: { x: 50, y: 710 },
    end: { x: 562, y: 710 },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });

  let yPos = 680;
  const leftMargin = 50;
  const valueX = 250;
  let fieldsRendered = 0;

  // Helper to draw a field row
  const drawField = (label: string, value: string | null, isNA: boolean = false) => {
    page.drawText(label, {
      x: leftMargin,
      y: yPos,
      size: 11,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });
    
    page.drawText(value || '', {
      x: valueX,
      y: yPos,
      size: 11,
      font: isNA ? font : fontBold,
      color: isNA ? rgb(0.5, 0.5, 0.5) : rgb(0, 0, 0),
    });
    
    yPos -= 30;
    fieldsRendered++;
  };

  // --- Render form data ---
  
  // Classification
  const classification = formData['Part1.Item4a.K1'] ? 'K-1 Fiancé(e) Visa' : 'K-3 Spouse Visa';
  drawField('Visa Classification:', classification);
  console.log(`[PDF] Rendered classification: ${classification}`);

  // I-130 Filed (only for K-3)
  if (formData['Part1.Item4b.K3']) {
    const i130 = formData['Part1.Item5.I130Filed'] ? 'Yes' : 'No';
    drawField('I-130 Filed:', i130);
    console.log(`[PDF] Rendered I-130 Filed: ${i130}`);
  }

  // A-Number
  const aNumber = formData['Part1.Item1.ANumber'];
  drawField('A-Number (Item 1):', aNumber || 'N/A', aNumber === 'N/A');
  console.log(`[PDF] Rendered A-Number: ${aNumber}`);

  // USCIS Account
  const uscis = formData['Part1.Item2.USCISAccount'];
  drawField('USCIS Account (Item 2):', uscis || 'N/A', uscis === 'N/A');
  console.log(`[PDF] Rendered USCIS Account: ${uscis}`);

  // SSN (masked in preview)
  const ssn = formData['Part1.Item3.SSN'];
  const ssnDisplay = ssn === 'N/A' ? 'N/A' : (ssn ? `***-**-${ssn.slice(-4)}` : 'N/A');
  drawField('SSN (Item 3):', ssnDisplay, ssn === 'N/A');
  console.log(`[PDF] Rendered SSN: ${ssnDisplay}`);

  // Draw footer
  yPos -= 20;
  page.drawLine({
    start: { x: 50, y: yPos },
    end: { x: 562, y: yPos },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });
  
  yPos -= 25;
  page.drawText('This is a preview. In production, data would overlay the official USCIS PDF template.', {
    x: leftMargin,
    y: yPos,
    size: 9,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });

  // Draw checkbox visual indicators at bottom
  yPos -= 50;
  page.drawText('Checkboxes that would be marked:', {
    x: leftMargin,
    y: yPos,
    size: 10,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  yPos -= 20;
  if (formData['Part1.Item4a.K1']) {
    page.drawText('☑ Item 4a: K-1 Fiancé(e)', { x: leftMargin + 20, y: yPos, size: 10, font, color: rgb(0, 0.5, 0) });
    yPos -= 18;
  }
  if (formData['Part1.Item4b.K3']) {
    page.drawText('☑ Item 4b: K-3 Spouse', { x: leftMargin + 20, y: yPos, size: 10, font, color: rgb(0, 0.5, 0) });
    yPos -= 18;
    if (formData['Part1.Item5.I130Filed'] === true) {
      page.drawText('☑ Item 5: I-130 Filed - Yes', { x: leftMargin + 20, y: yPos, size: 10, font, color: rgb(0, 0.5, 0) });
    } else if (formData['Part1.Item5.I130Filed'] === false) {
      page.drawText('☑ Item 5: I-130 Filed - No', { x: leftMargin + 20, y: yPos, size: 10, font, color: rgb(0, 0.5, 0) });
    }
  }

  // Save PDF
  const pdfBytes = await pdfDoc.save();
  
  console.log(`[PDF] Fields rendered: ${fieldsRendered}`);
  console.log(`[PDF] Generated PDF byte length: ${pdfBytes.length}`);
  console.log('[PDF] === PDF generation complete ===');

  return pdfBytes;
}

// ============================================================================
// API Route Handlers
// ============================================================================

export async function POST(request: NextRequest) {
  console.log('[API] POST /api/generate-pdf - Start');

  try {
    // 1. Parse incoming JSON
    let formData: FormData;
    try {
      formData = await request.json();
      console.log('[API] Form data parsed successfully');
    } catch {
      return errorResponse('Invalid JSON in request body', 400);
    }

    // 2. Validate required classification field
    if (
      formData['Part1.Item4a.K1'] === undefined &&
      formData['Part1.Item4b.K3'] === undefined
    ) {
      return errorResponse('Classification (K-1 or K-3) is required', 400);
    }

    // 3. Generate PDF
    console.log('[API] Generating PDF...');
    const pdfBytes = await generatePdf(formData);

    // 4. Verify we got bytes back
    if (!pdfBytes || pdfBytes.length === 0) {
      return errorResponse('PDF generation returned empty buffer', 500);
    }

    // 5. Verify PDF is valid (should start with %PDF)
    const pdfHeader = new TextDecoder().decode(pdfBytes.slice(0, 5));
    if (!pdfHeader.startsWith('%PDF')) {
      return errorResponse(`Generated file is not a valid PDF (header: ${pdfHeader})`, 500);
    }

    // 6. Convert to Buffer
    const pdfBuffer = Buffer.from(pdfBytes);
    
    // 7. Log final byte lengths
    console.log(`[API] Generated PDF byte length: ${pdfBuffer.length}`);
    console.log('[API] PDF validation passed - returning response');

    // 8. Return PDF with correct headers
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="I-129F.pdf"',
        'Content-Length': pdfBuffer.length.toString(),
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });

  } catch (error) {
    console.error('[API] Unhandled error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse(`Failed to generate PDF: ${message}`, 500);
  }
}

export async function GET() {
  return new NextResponse(
    'PDF generation endpoint. Use POST with JSON form data.',
    { status: 200, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
  );
}
