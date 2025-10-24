import type React from "react"

const FormSubmissionInfo: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="text-lg font-medium text-yellow-800 mb-2">Form Configuration Required</h3>
      <p className="text-yellow-700 mb-2">
        This is a static site and requires a form submission service. Please follow these steps:
      </p>
      <ol className="list-decimal pl-5 space-y-1 text-yellow-700">
        <li>
          Create a free account at{" "}
          <a href="https://formspree.io" target="_blank" rel="noopener noreferrer" className="underline">
            Formspree.io
          </a>
        </li>
        <li>Create a new form and get your form ID</li>
        <li>
          Replace <code className="bg-yellow-100 px-1 rounded">YOUR_FORM_ID</code> in the handleSubmit function with
          your actual form ID
        </li>
      </ol>
      <p className="mt-2 text-sm text-yellow-700">Other alternatives: Netlify Forms, FormSubmit.co, or Google Forms</p>
    </div>
  )
}

export default FormSubmissionInfo