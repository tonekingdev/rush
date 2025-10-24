import { jsPDF } from "jspdf"

// Define types for form data to match FormDataWithComplexTypes from the component
interface ProviderFormData {
  firstName: string
  lastName: string
  username: string
  fullAddress: string
  phone: string
  liabilityFormSigned: boolean
  liabilitySignature: string
  liabilitySignatureDate: string
  backgroundCheckAcknowledged: boolean
  malpracticeInsuranceAcknowledged: boolean
  licenseType: string
  licenseNumber: string
  malpracticeInsuranceProvider: string
  exclusionScreeningSigned: boolean
  exclusionScreeningSignature: string
  exclusionScreeningSignatureDate: string
  drugAlcoholFormSigned: boolean
  drugAlcoholSignature: string
  drugAlcoholSignatureDate: string
  citizenshipAttestationSigned: boolean
  citizenshipSignature: string
  citizenshipSignatureDate: string
  dateOfBirth: string
  positionAppliedFor: string
  citizenshipStatus: string
  // NEW: Non-Compete Clause fields
  nonCompeteSigned: boolean
  nonCompeteSignature: string
  nonCompeteSignatureDate: string
  // Add index signature for compatibility
  [key: string]: string | boolean
}

/**
 * Generate a PDF for the Professional Liability Waiver
 */
export const generateLiabilityPDF = async (formData: ProviderFormData): Promise<File> => {
  // Create a new PDF document
  const doc = new jsPDF()

  // Set document properties
  doc.setProperties({
    title: "Professional Liability Waiver",
    author: "PC BRAINIACS LLC d.b.a. Tone King Development",
    subject: "Provider Application",
    keywords: "healthcare, provider, application, liability waiver",
  })

  // Add header
  doc.setFillColor(21, 134, 214) // #1586D6
  doc.rect(0, 0, 210, 20, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.text("RUSH Healthcare - Professional Liability Waiver", 105, 12, { align: "center" })

  // Reset text color for body
  doc.setTextColor(0, 0, 0)

  // Add content to the PDF
  doc.setFontSize(14)
  doc.text("Professional Liability Waiver and Indemnification Agreement", 105, 30, { align: "center" })

  doc.setFontSize(10)
  let y = 40
  doc.text('This Professional Liability Waiver ("Waiver") is entered into by and between RUSH Servicing', 20, y)
  y += 5
  doc.text('LLC ("Company") and the undersigned independent contractor ("Provider").', 20, y)

  y += 10
  doc.setFontSize(12)
  doc.text("1. Acknowledgment of Independent Status", 20, y)
  y += 6
  doc.setFontSize(10)
  doc.text(
    "The Provider acknowledges they are an independent contractor and not an employee of RUSH Servicing LLC.",
    25,
    y,
  )

  y += 10
  doc.setFontSize(12)
  doc.text("2. Provider's Responsibility for Professional Services", 20, y)
  y += 6
  doc.setFontSize(10)
  doc.text(
    "The Provider agrees and understands that they are solely responsible for maintaining appropriate and",
    25,
    y,
  )
  y += 5
  doc.text(
    "active malpractice insurance coverage and for the quality and safety of the professional services they",
    25,
    y,
  )
  y += 5
  doc.text("provide to patients.", 25, y)

  y += 10
  doc.setFontSize(12)
  doc.text("3. Waiver of Liability", 20, y)
  y += 6
  doc.setFontSize(10)
  doc.text("The Provider hereby waives, releases, and discharges RUSH Servicing LLC, its officers, directors,", 25, y)
  y += 5
  doc.text("employees, agents, and affiliates from any and all claims, demands, actions, or causes of action", 25, y)
  y += 5
  doc.text("arising out of or related to any alleged malpractice, negligence, or breach of professional duty", 25, y)
  y += 5
  doc.text("committed by the Provider.", 25, y)

  y += 10
  doc.setFontSize(12)
  doc.text("4. Indemnification", 20, y)
  y += 6
  doc.setFontSize(10)
  doc.text("The Provider agrees to defend, indemnify, and hold harmless RUSH Servicing LLC from any and all", 25, y)
  y += 5
  doc.text("liabilities, claims, costs, or expenses (including reasonable attorney's fees) arising from any", 25, y)
  y += 5
  doc.text(
    "act, omission, or negligence by the Provider in connection with the provision of services to patients.",
    25,
    y,
  )

  y += 10
  doc.setFontSize(12)
  doc.text("5. Insurance Requirement", 20, y)
  y += 6
  doc.setFontSize(10)
  doc.text("The Provider certifies they maintain active malpractice insurance with minimum coverage of", 25, y)
  y += 5
  doc.text("$200,000-$600,000 and agrees to furnish proof of such insurance upon request.", 25, y)

  y += 10
  doc.setFontSize(12)
  doc.text("6. Entire Agreement", 20, y)
  y += 6
  doc.setFontSize(10)
  doc.text("This Waiver constitutes the entire agreement between the parties regarding liability and", 25, y)
  y += 5
  doc.text("indemnification and supersedes any prior agreements.", 25, y)

  // Provider Information
  y += 15
  doc.setFontSize(12)
  doc.text("Provider Information:", 20, y)

  y += 8
  doc.setFontSize(10)
  doc.text(`Provider Name: ${formData.firstName || ""} ${formData.lastName || ""}`, 25, y)

  y += 6
  doc.text(`License Type: ${formData.licenseType || ""}`, 25, y)

  y += 6
  doc.text(`License Number: ${formData.licenseNumber || ""}`, 25, y)

  y += 6
  doc.text(`Malpractice Insurance Provider: ${formData.malpracticeInsuranceProvider || ""}`, 25, y)

  // Add signature
  y += 15
  doc.text("Provider Signature:", 20, y)

  // Convert signature data URL to image and add to PDF
  if (formData.liabilitySignature) {
    try {
      // Clean up the data URL if needed
      const imgData = formData.liabilitySignature.startsWith("data:image")
        ? formData.liabilitySignature
        : `data:image/png;base64,${formData.liabilitySignature}`

      doc.addImage(imgData, "PNG", 70, y - 10, 60, 20)
    } catch (error) {
      console.error("Error adding signature to PDF:", error)
    }
  }

  y += 15
  doc.text(`Date: ${formData.liabilitySignatureDate || new Date().toISOString().split("T")[0]}`, 20, y)

  // Add footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)
    doc.text(`RUSH Healthcare - Professional Liability Waiver - Page ${i} of ${pageCount}`, 105, 290, {
      align: "center",
    })
  }

  // Save the PDF as a blob
  const pdfBlob = doc.output("blob")

  // Create a File object from the blob
  const pdfFile = new File(
    [pdfBlob],
    `RUSH_Liability_Waiver_${formData.lastName || "Unknown"}_${formData.firstName || "Unknown"}.pdf`,
    {
      type: "application/pdf",
    },
  )

  return pdfFile
}

/**
 * Generate a PDF for the Provider Exclusion Screening Policy & Acknowledgment
 */
export const generateExclusionPDF = async (formData: ProviderFormData): Promise<File> => {
  // Create a new PDF document
  const doc = new jsPDF()

  // Set document properties
  doc.setProperties({
    title: "Provider Exclusion Screening Policy & Acknowledgment",
    author: "PC BRAINIACS LLC d.b.a. Tone King Development",
    subject: "Provider Application",
    keywords: "healthcare, provider, application, exclusion screening",
  })

  // Add header
  doc.setFillColor(21, 134, 214) // #1586D6
  doc.rect(0, 0, 210, 20, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.text("RUSH Healthcare - Provider Exclusion Screening Policy", 105, 12, { align: "center" })

  // Reset text color for body
  doc.setTextColor(0, 0, 0)

  // Add content to the PDF
  doc.setFontSize(14)
  doc.text("Provider Exclusion Screening Policy & Acknowledgment", 105, 30, { align: "center" })

  doc.setFontSize(10)
  let y = 40
  doc.text("Effective Date: May 03, 2025", 20, y)
  y += 5
  doc.text("Applies To: All Providers, Contractors, and Staff", 20, y)

  y += 10
  doc.setFontSize(12)
  doc.text("Purpose:", 20, y)
  y += 6
  doc.setFontSize(10)
  doc.text("To ensure that RUSH Servicing LLC remains compliant with federal regulations by prohibiting the", 20, y)
  y += 5
  doc.text(
    "employment or contracting of any individual or entity excluded from participation in federally funded",
    20,
    y,
  )
  y += 5
  doc.text("healthcare programs.", 20, y)

  y += 10
  doc.setFontSize(12)
  doc.text("Policy:", 20, y)
  y += 6
  doc.setFontSize(10)
  doc.text(
    "RUSH will not hire or contract with any individual or entity that appears on the Office of Inspector",
    20,
    y,
  )
  y += 5
  doc.text("General's List of Excluded Individuals and Entities (LEIE) or the System for Award Management (SAM)", 20, y)
  y += 5
  doc.text("exclusion database.", 20, y)

  y += 10
  doc.setFontSize(12)
  doc.text("Procedure:", 20, y)

  y += 8
  doc.text("1. Pre-Hire Screening:", 20, y)
  y += 6
  doc.setFontSize(10)
  doc.text("• All prospective providers and staff must be screened against the LEIE and SAM databases.", 25, y)
  y += 5
  doc.text(
    "• Screening will be documented with a screenshot or verification log placed in the provider's credential file.",
    25,
    y,
  )

  y += 8
  doc.setFontSize(12)
  doc.text("2. Ongoing Monthly Monitoring:", 20, y)
  y += 6
  doc.setFontSize(10)
  doc.text("• RUSH will re-screen active providers and staff monthly against both databases.", 25, y)
  y += 5
  doc.text("• Automated screening tools (e.g., Verisys, MedCred, or Checkr add-ons) may be used for efficiency.", 25, y)

  y += 8
  doc.setFontSize(12)
  doc.text("3. Positive Match Protocol:", 20, y)
  y += 6
  doc.setFontSize(10)
  doc.text(
    "• If a match is found, the individual or entity will be immediately suspended from duties pending verification.",
    25,
    y,
  )
  y += 5
  doc.text("• If confirmed, the individual will be terminated or disqualified from contracting with RUSH.", 25, y)

  // Provider Acknowledgment
  y += 15
  doc.setFontSize(12)
  doc.text("Provider Acknowledgment & Signature", 105, y, { align: "center" })

  y += 8
  doc.setFontSize(10)
  doc.text(
    "By signing below, I acknowledge that I have read and understand the RUSH Provider Exclusion Screening",
    20,
    y,
  )
  y += 5
  doc.text(
    "Policy. I affirm that I am not currently listed on the OIG LEIE or SAM exclusion databases. I agree to notify",
    20,
    y,
  )
  y += 5
  doc.text(
    "RUSH Servicing LLC immediately if I become aware of any action or event that may result in my exclusion",
    20,
    y,
  )
  y += 5
  doc.text("from participation in federally funded healthcare programs.", 20, y)

  y += 15
  doc.text(`Provider Name: ${formData.firstName || ""} ${formData.lastName || ""}`, 20, y)

  // Add signature
  y += 15
  doc.text("Provider Signature:", 20, y)

  // Convert signature data URL to image and add to PDF
  if (formData.exclusionScreeningSignature) {
    try {
      // Clean up the data URL if needed
      const imgData = formData.exclusionScreeningSignature.startsWith("data:image")
        ? formData.exclusionScreeningSignature
        : `data:image/png;base64,${formData.exclusionScreeningSignature}`

      doc.addImage(imgData, "PNG", 70, y - 10, 60, 20)
    } catch (error) {
      console.error("Error adding signature to PDF:", error)
    }
  }

  y += 15
  doc.text(`Date: ${formData.exclusionScreeningSignatureDate || new Date().toISOString().split("T")[0]}`, 20, y)

  // Add footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)
    doc.text(`RUSH Healthcare - Provider Exclusion Screening Policy - Page ${i} of ${pageCount}`, 105, 290, {
      align: "center",
    })
  }

  // Save the PDF as a blob
  const pdfBlob = doc.output("blob")

  // Create a File object from the blob
  const pdfFile = new File(
    [pdfBlob],
    `RUSH_Exclusion_Screening_${formData.lastName || "Unknown"}_${formData.firstName || "Unknown"}.pdf`,
    {
      type: "application/pdf",
    },
  )

  return pdfFile
}

/**
 * Generate a PDF for the Drug and Alcohol-Free Workplace Acknowledgment Form
 */
export const generateDrugAlcoholPDF = async (formData: ProviderFormData): Promise<File> => {
  // Create a new PDF document
  const doc = new jsPDF()

  // Set document properties
  doc.setProperties({
    title: "Drug and Alcohol-Free Workplace Acknowledgment",
    author: "PC BRAINIACS LLC d.b.a. Tone King Development",
    subject: "Provider Application",
    keywords: "healthcare, provider, application, drug, alcohol, policy",
  })

  // Add header
  doc.setFillColor(21, 134, 214) // #1586D6
  doc.rect(0, 0, 210, 20, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.text("RUSH Healthcare - Drug and Alcohol-Free Workplace Policy", 105, 12, { align: "center" })

  // Reset text color for body
  doc.setTextColor(0, 0, 0)

  // Add content to the PDF
  doc.setFontSize(14)
  doc.text("RUSH SERVICING LLC", 105, 30, { align: "center" })
  doc.text("Drug- and Alcohol-Free Workplace Acknowledgment Form", 105, 40, { align: "center" })

  doc.setFontSize(10)
  let y = 55
  doc.text(`Provider Name: ${formData.firstName || ""} ${formData.lastName || ""}`, 20, y)
  y += 6
  doc.text(`Date: ${formData.drugAlcoholSignatureDate || new Date().toISOString().split("T")[0]}`, 20, y)

  y += 12
  doc.text('At RUSH Servicing LLC ("RUSH"), we are committed to ensuring a safe, professional, and', 20, y)
  y += 5
  doc.text("high-quality healthcare environment for both our patients and our healthcare professionals.", 20, y)
  y += 5
  doc.text("To support this mission, we require all independent contractors to agree to and abide by a", 20, y)
  y += 5
  doc.text("drug- and alcohol-free workplace policy.", 20, y)

  y += 10
  doc.setFontSize(12)
  doc.text("Policy Statement", 20, y)
  y += 8

  doc.setFontSize(10)
  doc.text("1. Abstain from the use, possession, distribution, or sale of illegal drugs, controlled", 20, y)
  y += 5
  doc.text("   substances (without a prescription), or alcohol while performing services on behalf of", 20, y)
  y += 5
  doc.text("   RUSH, whether at a patient's home, a partner facility, or during any virtual encounters.", 20, y)

  y += 8
  doc.text("2. Report to duty in a physical and mental state fit for providing care. Providers must not", 20, y)
  y += 5
  doc.text("   be under the influence of drugs or alcohol during any professional interaction related", 20, y)
  y += 5
  doc.text("   to their role with RUSH.", 20, y)

  y += 8
  doc.text("3. Understand that RUSH maintains zero tolerance for drug or alcohol use in connection", 20, y)
  y += 5
  doc.text("   with service delivery. Any violation of this policy may result in immediate termination", 20, y)
  y += 5
  doc.text("   of the provider's contract and may be reported to relevant licensing boards or authorities.", 20, y)

  y += 8
  doc.text("4. Submit to reasonable investigation or review if there is suspicion or evidence of", 20, y)
  y += 5
  doc.text("   impairment while on assignment, in accordance with applicable law.", 20, y)

  y += 8
  doc.text("5. Comply with all state and federal laws regarding controlled substances, drug use, and", 20, y)
  y += 5
  doc.text("   professional conduct.", 20, y)

  y += 12
  doc.setFontSize(12)
  doc.text("Acknowledgment and Agreement", 20, y)
  y += 8

  doc.setFontSize(10)
  doc.text("By signing below, I acknowledge that I have read, understand, and agree to comply with the", 20, y)
  y += 5
  doc.text("RUSH Servicing LLC Drug- and Alcohol-Free Workplace Policy. I understand that failure to", 20, y)
  y += 5
  doc.text("adhere to this policy may result in disciplinary action, including immediate termination of", 20, y)
  y += 5
  doc.text("my contract and possible legal or professional consequences.", 20, y)

  // Add signature
  y += 15
  doc.text("Signature:", 20, y)

  // Convert signature data URL to image and add to PDF
  if (formData.drugAlcoholSignature) {
    try {
      // Clean up the data URL if needed
      const imgData = formData.drugAlcoholSignature.startsWith("data:image")
        ? formData.drugAlcoholSignature
        : `data:image/png;base64,${formData.drugAlcoholSignature}`

      doc.addImage(imgData, "PNG", 70, y - 10, 60, 20)
    } catch (error) {
      console.error("Error adding signature to PDF:", error)
    }
  }

  y += 15
  doc.text(`Printed Name: ${formData.firstName || ""} ${formData.lastName || ""}`, 20, y)
  y += 6
  doc.text(`Date: ${formData.drugAlcoholSignatureDate || new Date().toISOString().split("T")[0]}`, 20, y)

  // Add footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)
    doc.text(`RUSH Healthcare - Drug and Alcohol-Free Workplace Policy - Page ${i} of ${pageCount}`, 105, 290, {
      align: "center",
    })
  }

  // Save the PDF as a blob
  const pdfBlob = doc.output("blob")

  // Create a File object from the blob
  const pdfFile = new File(
    [pdfBlob],
    `RUSH_Drug_Alcohol_Policy_${formData.lastName || "Unknown"}_${formData.firstName || "Unknown"}.pdf`,
    {
      type: "application/pdf",
    },
  )

  return pdfFile
}

/**
 * Generate a PDF for the RUSH Citizenship Attestation
 */
export const generateCitizenshipPDF = async (formData: ProviderFormData): Promise<File> => {
  // Create a new PDF document
  const doc = new jsPDF()

  // Set document properties
  doc.setProperties({
    title: "RUSH Citizenship Attestation",
    author: "PC BRAINIACS LLC d.b.a. Tone King Development",
    subject: "Provider Application",
    keywords: "healthcare, provider, application, citizenship, attestation",
  })

  // Add header
  doc.setFillColor(21, 134, 214) // #1586D6
  doc.rect(0, 0, 210, 20, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.text("RUSH Healthcare - Citizenship Attestation", 105, 12, { align: "center" })

  // Reset text color for body
  doc.setTextColor(0, 0, 0)

  // Add content to the PDF
  doc.setFontSize(14)
  doc.text("RUSH Citizenship Attestation", 105, 30, { align: "center" })

  doc.setFontSize(10)
  let y = 50

  // Applicant Information
  doc.text(`Applicant Name: ${formData.firstName || ""} ${formData.lastName || ""}`, 20, y)
  y += 8
  doc.text(`Date of Birth: ${formData.dateOfBirth || ""}`, 20, y)
  y += 8
  doc.text(`Position Applied For: ${formData.positionAppliedFor || "Healthcare Provider"}`, 20, y)

  y += 15
  doc.text("In accordance with federal and state employment and contracting laws, RUSH", 20, y)
  y += 5
  doc.text("Servicing LLC requires all independent contractors and providers to verify their", 20, y)
  y += 5
  doc.text("legal authorization to work in the United States.", 20, y)

  y += 12
  doc.text("By signing this form, I, the undersigned, attest to the following:", 20, y)

  y += 10
  // Citizenship status options
  const citizenshipOptions = {
    us_citizen: "I am a citizen of the United States",
    permanent_resident: "I am a lawful permanent resident (Green Card holder)",
    work_authorized: "I am otherwise legally authorized to work in the United States (with valid documentation)",
  }

  let optionNumber = 1
  for (const [key, text] of Object.entries(citizenshipOptions)) {
    const isSelected = formData.citizenshipStatus === key
    doc.text(`${optionNumber}. ${text} ${isSelected ? "✓" : ""}`, 20, y)
    y += 8
    optionNumber++
  }

  y += 10
  doc.text("I understand that I may be required to submit proof of my citizenship or legal", 20, y)
  y += 5
  doc.text("authorization to work as a condition of my credentialing with RUSH.", 20, y)

  y += 10
  doc.text("I hereby declare under penalty of perjury that the information provided in this", 20, y)
  y += 5
  doc.text("attestation is true and correct.", 20, y)

  // Add signature
  y += 20
  doc.text("Signature:", 20, y)

  // Convert signature data URL to image and add to PDF
  if (formData.citizenshipSignature) {
    try {
      // Clean up the data URL if needed
      const imgData = formData.citizenshipSignature.startsWith("data:image")
        ? formData.citizenshipSignature
        : `data:image/png;base64,${formData.citizenshipSignature}`

      doc.addImage(imgData, "PNG", 70, y - 10, 60, 20)
    } catch (error) {
      console.error("Error adding signature to PDF:", error)
    }
  }

  y += 20
  doc.text(`Date: ${formData.citizenshipSignatureDate || new Date().toISOString().split("T")[0]}`, 20, y)
  y += 8
  doc.text(`Printed Name: ${formData.firstName || ""} ${formData.lastName || ""}`, 20, y)

  // Add footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)
    doc.text(`RUSH Healthcare - Citizenship Attestation - Page ${i} of ${pageCount}`, 105, 290, {
      align: "center",
    })
  }

  // Save the PDF as a blob
  const pdfBlob = doc.output("blob")

  // Create a File object from the blob
  const pdfFile = new File(
    [pdfBlob],
    `RUSH_Citizenship_Attestation_${formData.lastName || "Unknown"}_${formData.firstName || "Unknown"}.pdf`,
    {
      type: "application/pdf",
    },
  )

  return pdfFile
}

/**
 * NEW: Generate a PDF for the Non-Compete & Independent Contractor Liability Clause
 */
export const generateNonCompetePDF = async (formData: ProviderFormData): Promise<File> => {
  // Create a new PDF document
  const doc = new jsPDF()

  // Set document properties
  doc.setProperties({
    title: "Non-Compete & Independent Contractor Liability Clause",
    author: "PC BRAINIACS LLC d.b.a. Tone King Development",
    subject: "Provider Application",
    keywords: "healthcare, provider, application, non-compete, liability",
  })

  // Add header
  doc.setFillColor(21, 134, 214) // #1586D6
  doc.rect(0, 0, 210, 20, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.text("RUSH Healthcare - Non-Compete & Liability Clause", 105, 12, { align: "center" })

  // Reset text color for body
  doc.setTextColor(0, 0, 0)

  // Add content to the PDF
  doc.setFontSize(14)
  doc.text("Non-Compete & Independent Contractor Liability Clause", 105, 30, { align: "center" })
  doc.text("(For RUSH Servicing LLC and RUSHCARES)", 105, 40, { align: "center" })

  doc.setFontSize(10)
  let y = 55

  // Section 1: Independent Contractor Acknowledgement
  doc.setFontSize(12)
  doc.text("1. Independent Contractor Acknowledgement", 20, y)
  y += 8
  doc.setFontSize(10)
  doc.text("The undersigned acknowledges that they are engaged as an independent contractor (1099", 20, y)
  y += 5
  doc.text("status) and not an employee of RUSH Servicing LLC or RUSHCARES. As such, the contractor", 20, y)
  y += 5
  doc.text("is solely responsible for all taxes, insurance, and benefits, including but not limited to health", 20, y)
  y += 5
  doc.text("insurance, unemployment insurance, and workers' compensation.", 20, y)

  y += 12
  // Section 2: Malpractice & Legal Liability
  doc.setFontSize(12)
  doc.text("2. Malpractice & Legal Liability", 20, y)
  y += 8
  doc.setFontSize(10)
  doc.text("The contractor agrees and acknowledges that they are individually responsible for", 20, y)
  y += 5
  doc.text("obtaining and maintaining active malpractice (professional liability) insurance coverage", 20, y)
  y += 5
  doc.text("throughout the duration of their contract with RUSH Servicing LLC and/or RUSHCARES. In", 20, y)
  y += 5
  doc.text("the event of any lawsuit, claim, or legal action arising from the contractor's acts or", 20, y)
  y += 5
  doc.text("omissions in the course of providing care, the contractor shall bear full responsibility,", 20, y)
  y += 5
  doc.text("including all associated legal and financial liabilities. RUSH Servicing LLC and RUSHCARES", 20, y)
  y += 5
  doc.text("will not be held liable for any legal, civil, or professional claims brought against any", 20, y)
  y += 5
  doc.text("contractor for services rendered.", 20, y)

  y += 12
  // Section 3: Non-Compete & Non-Solicitation Agreement
  doc.setFontSize(12)
  doc.text("3. Non-Compete & Non-Solicitation Agreement", 20, y)
  y += 8
  doc.setFontSize(10)
  doc.text("The contractor agrees that during the term of their contract with RUSH Servicing LLC", 20, y)
  y += 5
  doc.text("and/or RUSHCARES, and for a period of one (1) year following the termination of their", 20, y)
  y += 5
  doc.text("contract, they shall not directly or indirectly:", 20, y)

  y += 8
  doc.text("• a. Solicit or accept clients, patients, or facilities introduced to them by RUSH Servicing or", 25, y)
  y += 5
  doc.text("     RUSHCARES for the purpose of offering competing home healthcare services;", 25, y)

  y += 8
  doc.text("• b. Provide home healthcare or related services to any patient, client, or facility initially", 25, y)
  y += 5
  doc.text("     contracted through RUSH Servicing LLC or RUSHCARES outside of this agreement;", 25, y)

  y += 8
  doc.text("• c. Divert or attempt to divert any patient, caregiver, or contracted worker from RUSH", 25, y)
  y += 5
  doc.text("     Servicing LLC or RUSHCARES for personal gain or to benefit another company or", 25, y)
  y += 5
  doc.text("     individual.", 25, y)

  y += 10
  doc.text("Violation of this clause may result in immediate termination of the contract and may subject", 20, y)
  y += 5
  doc.text("the contractor to legal action for damages, including but not limited to lost profits and", 20, y)
  y += 5
  doc.text("breach of agreement.", 20, y)

  y += 12
  // Section 4: Agreement and Signature
  doc.setFontSize(12)
  doc.text("4. Agreement and Signature", 20, y)
  y += 8
  doc.setFontSize(10)
  doc.text("By signing below, the contractor affirms that they have read, understood, and agreed to the", 20, y)
  y += 5
  doc.text("terms of this Non-Compete & Liability Clause and understands their rights and obligations", 20, y)
  y += 5
  doc.text("under this agreement.", 20, y)

  y += 15
  doc.text(`Contractor Full Name: ${formData.firstName || ""} ${formData.lastName || ""}`, 20, y)

  // Add signature
  y += 15
  doc.text("Signature:", 20, y)

  // Convert signature data URL to image and add to PDF
  if (formData.nonCompeteSignature) {
    try {
      // Clean up the data URL if needed
      const imgData = formData.nonCompeteSignature.startsWith("data:image")
        ? formData.nonCompeteSignature
        : `data:image/png;base64,${formData.nonCompeteSignature}`

      doc.addImage(imgData, "PNG", 70, y - 10, 60, 20)
    } catch (error) {
      console.error("Error adding signature to PDF:", error)
    }
  }

  y += 15
  doc.text(`Date: ${formData.nonCompeteSignatureDate || new Date().toISOString().split("T")[0]}`, 20, y)

  // Add footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)
    doc.text(`RUSH Healthcare - Non-Compete & Liability Clause - Page ${i} of ${pageCount}`, 105, 290, {
      align: "center",
    })
  }

  // Save the PDF as a blob
  const pdfBlob = doc.output("blob")

  // Create a File object from the blob
  const pdfFile = new File(
    [pdfBlob],
    `RUSH_Non_Compete_Clause_${formData.lastName || "Unknown"}_${formData.firstName || "Unknown"}.pdf`,
    {
      type: "application/pdf",
    },
  )

  return pdfFile
}