import { jsPDF } from 'jspdf';
import { ChatMessage } from '../types';

export interface PdfExportOptions {
  title?: string;
  subject?: string;
  includeTimestamps?: boolean;
  includeStudyWorksheet?: boolean;
  studentName?: string;
  categoryName?: string;
}

/**
 * Clean text to avoid non-printable or unsupported standard font ASCII glitches
 */
function sanitizeText(str: string): string {
  if (!str) return '';
  // Standard jsPDF built-in fonts (Helvetica) support Latin-1 characters
  // Replace smart quotes and dashes with standard ASCII
  return str
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');
}

/**
 * Exports the chat history as a professionally formatted academic PDF
 * optimized for printing, digital reading, and offline study.
 */
export function exportChatToPdf(
  messages: ChatMessage[],
  options: PdfExportOptions = {}
): void {
  if (!messages || messages.length === 0) {
    throw new Error('No messages to export');
  }

  const {
    title = 'OmniAI Study Notes & Chat History',
    subject = 'General Study & Technical Revision',
    includeTimestamps = true,
    includeStudyWorksheet = true,
    studentName = 'Student',
    categoryName = 'Education & Revision',
  } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 16;
  const marginTop = 20;
  const marginBottom = 20;
  const contentWidth = pageWidth - marginX * 2;
  const maxContentY = pageHeight - marginBottom;

  let currentY = marginTop;

  // Track page count helper
  const addPageHeaderAndFooter = (
    docInstance: jsPDF,
    pageNumber: number,
    isFirstPage: boolean
  ) => {
    // Header (omit on first page to give room for hero banner)
    if (!isFirstPage) {
      docInstance.setFont('helvetica', 'normal');
      docInstance.setFontSize(8);
      docInstance.setTextColor(130, 140, 160);
      docInstance.text('OmniAI Study Session • Offline Study Material', marginX, 12);
      docInstance.text(
        sanitizeText(title.substring(0, 45)),
        pageWidth - marginX,
        12,
        { align: 'right' }
      );
      docInstance.setDrawColor(226, 232, 240);
      docInstance.setLineWidth(0.3);
      docInstance.line(marginX, 14, pageWidth - marginX, 14);
    }

    // Footer (all pages)
    docInstance.setFont('helvetica', 'normal');
    docInstance.setFontSize(8);
    docInstance.setTextColor(140, 150, 170);
    docInstance.setDrawColor(226, 232, 240);
    docInstance.setLineWidth(0.3);
    docInstance.line(marginX, pageHeight - 12, pageWidth - marginX, pageHeight - 12);

    docInstance.text(
      'Exported for Offline Study • Generated via OmniAI Nexus',
      marginX,
      pageHeight - 8
    );
    docInstance.text(
      `Page ${pageNumber}`,
      pageWidth - marginX,
      pageHeight - 8,
      { align: 'right' }
    );
  };

  // Helper to ensure vertical room or create new page
  const ensureSpace = (neededHeight: number): void => {
    if (currentY + neededHeight > maxContentY) {
      doc.addPage();
      currentY = marginTop;
    }
  };

  // ==========================================
  // PAGE 1: HERO HEADER & STUDY METADATA
  // ==========================================
  // Header Banner Card
  const bannerHeight = 36;
  doc.setFillColor(30, 41, 59); // Slate-800
  doc.roundedRect(marginX, currentY, contentWidth, bannerHeight, 3, 3, 'F');

  // Accent line on left of banner
  doc.setFillColor(99, 102, 241); // Indigo-500
  doc.roundedRect(marginX, currentY, 3.5, bannerHeight, 2, 2, 'F');

  // Title in banner
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text(sanitizeText(title), marginX + 8, currentY + 11);

  // Subtitle / category
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(203, 213, 225); // Slate-300
  doc.text(
    `Subject: ${sanitizeText(subject)}  •  Category: ${sanitizeText(categoryName)}`,
    marginX + 8,
    currentY + 19
  );

  // Metadata line (Date, Total Exchanges, Student)
  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const timeStr = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // Slate-400
  doc.text(
    `Date: ${dateStr} ${timeStr}  |  Exchanges: ${messages.length} messages  |  Student: ${sanitizeText(
      studentName
    )}`,
    marginX + 8,
    currentY + 28
  );

  currentY += bannerHeight + 8;

  // Quick Study Objective Box
  ensureSpace(14);
  doc.setFillColor(241, 245, 249); // Slate-100
  doc.setDrawColor(203, 213, 225); // Slate-300
  doc.setLineWidth(0.2);
  doc.roundedRect(marginX, currentY, contentWidth, 12, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('OFFLINE STUDY GUIDE & REVISION TRANSCRIPT', marginX + 4, currentY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'Keep this document for exam preparation, offline review, formula reference, and personal notes.',
    marginX + 4,
    currentY + 9.5
  );

  currentY += 18;

  // ==========================================
  // MESSAGES TRANSCRIPT
  // ==========================================
  messages.forEach((msg, idx) => {
    const isUser = msg.role === 'user';
    const senderBadge = isUser ? `STUDENT QUERY #${Math.floor(idx / 2) + 1}` : 'OMNIAI EXPLANATION';
    const badgeColor = isUser ? { r: 79, g: 70, b: 229 } : { r: 14, g: 116, b: 144 }; // Indigo vs Cyan/Teal
    const bgColor = isUser ? { r: 248, g: 250, b: 252 } : { r: 255, g: 255, b: 255 };
    const borderColor = isUser ? { r: 226, g: 232, b: 240 } : { r: 203, g: 213, b: 225 };

    // Clean message text
    const cleanContent = sanitizeText(msg.content);

    // Split text into lines fitted to the block width
    const textPadding = 4;
    const textBoxWidth = contentWidth - textPadding * 2;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const splitLines: string[] = doc.splitTextToSize(cleanContent, textBoxWidth);
    const textHeight = splitLines.length * 4.4;

    // Header badge height
    const headerHeight = 7;
    const totalBoxHeight = headerHeight + textHeight + 6;

    // If whole box doesn't fit and it's small, page break
    // If it's a very long response, we paginate line by line
    if (totalBoxHeight < 60) {
      ensureSpace(totalBoxHeight + 4);
    } else {
      ensureSpace(18);
    }

    const boxStartY = currentY;

    // Render Box Container Header
    doc.setFillColor(bgColor.r, bgColor.g, bgColor.b);
    doc.setDrawColor(borderColor.r, borderColor.g, borderColor.b);
    doc.setLineWidth(0.3);

    // We draw header bar first
    ensureSpace(headerHeight + 6);
    doc.setFillColor(isUser ? 241 : 240, isUser ? 245 : 249, isUser ? 249 : 255);
    doc.rect(marginX, currentY, contentWidth, headerHeight, 'F');

    // Accent indicator pill
    doc.setFillColor(badgeColor.r, badgeColor.g, badgeColor.b);
    doc.rect(marginX, currentY, 2.5, headerHeight, 'F');

    // Badge label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(badgeColor.r, badgeColor.g, badgeColor.b);
    doc.text(senderBadge, marginX + 5, currentY + 4.8);

    // Timestamp if requested
    if (includeTimestamps && msg.timestamp) {
      const msgTime = new Date(msg.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(msgTime, pageWidth - marginX - 4, currentY + 4.8, { align: 'right' });
    }

    currentY += headerHeight + 3;

    // Print text lines with automatic page breaking
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);

    for (let i = 0; i < splitLines.length; i++) {
      if (currentY + 6 > maxContentY) {
        doc.addPage();
        currentY = marginTop;
        // Continuation label
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.text(`(continued: ${senderBadge})`, marginX + 4, currentY);
        currentY += 5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(30, 41, 59);
      }

      const line = splitLines[i];
      // Detect bullet points or code-like indentation
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ') || /^\d+\./.test(line.trim())) {
        doc.setFont('helvetica', 'bold');
        doc.text(line, marginX + textPadding, currentY);
        doc.setFont('helvetica', 'normal');
      } else {
        doc.text(line, marginX + textPadding, currentY);
      }

      currentY += 4.4;
    }

    // Divider line between messages
    currentY += 4;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(marginX, currentY, pageWidth - marginX, currentY);
    currentY += 6;
  });

  // ==========================================
  // OPTIONAL: OFFLINE STUDY & REVISION SECTION
  // ==========================================
  if (includeStudyWorksheet) {
    // Add fresh page for the Study & Revision Worksheet
    doc.addPage();
    currentY = marginTop;

    // Worksheet Title Header
    doc.setFillColor(79, 70, 229); // Indigo-600
    doc.roundedRect(marginX, currentY, contentWidth, 14, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text('OFFLINE REVISION CHECKLIST & STUDY NOTES', marginX + 6, currentY + 9);
    currentY += 20;

    // Checklist cards
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    doc.text('1. Actionable Exam Checklist:', marginX, currentY);
    currentY += 6;

    const checklistItems = [
      'Read through all explanation steps and highlight key equations or definitions.',
      'Re-solve user query questions without looking at the AI solution.',
      'Identify 3 key takeaways and create personal flashcards or memory anchors.',
      'Test your comprehension by explaining concepts out loud or to a study partner.',
    ];

    checklistItems.forEach((item) => {
      doc.setDrawColor(99, 102, 241);
      doc.setLineWidth(0.4);
      doc.rect(marginX + 2, currentY - 3, 3.5, 3.5); // Checkbox square
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      doc.text(item, marginX + 8, currentY);
      currentY += 6;
    });

    currentY += 6;

    // Student Handwritten Notes Section (ruled notebook lines)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    doc.text('2. Student Handwritten Revision Notes:', marginX, currentY);
    currentY += 7;

    const remainingHeight = maxContentY - currentY;
    const lineSpacing = 7;
    const numberOfLines = Math.floor(remainingHeight / lineSpacing);

    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.2);

    for (let l = 0; l < numberOfLines; l++) {
      const lineY = currentY + l * lineSpacing;
      doc.line(marginX, lineY, pageWidth - marginX, lineY);
    }
  }

  // ==========================================
  // APPLY HEADERS AND FOOTERS TO ALL PAGES
  // ==========================================
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    addPageHeaderAndFooter(doc, p, p === 1);
  }

  // Clean filename
  const cleanTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 30);
  const fileName = `${cleanTitle || 'omni-study-notes'}-${new Date().toISOString().slice(0, 10)}.pdf`;

  // Trigger browser download
  doc.save(fileName);
}
