import { useParams } from 'react-router-dom';

export default function PdfViewerPage() {
    const { formType } = useParams();

    return (
        <div style={{ height: '100vh' }}>
            <iframe
                title="PDF Viewer"
                src={`/pdfs/${formType}.pdf`}
                width="100%"
                height="100%"
            />
        </div>
    );
}