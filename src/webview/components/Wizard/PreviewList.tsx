import { PreviewResult } from 'types/webview';

interface Props {
  preview: PreviewResult | null;
}

export const PreviewList: React.FC<Props> = ({ preview }) => {
  return (
    <section className="preview-panel">
      <div className="preview-panel-header">
        <span className="preview-panel-title">Files</span>
        {preview && preview.files.length > 0 && (
          <span className="preview-panel-count">{preview.files.length}</span>
        )}
      </div>

      {(!preview || preview.files.length === 0) && (
        <p className="preview-panel-empty">
          Complete the form to see which files will be created or modified.
        </p>
      )}

      {preview && preview.files.length > 0 && (
        <ul className="preview-file-list">
          {preview.files.map(file => (
            <li key={file.path} className="preview-file">
              <span className={`preview-file-badge preview-file-badge-${file.action}`}>
                {file.action}
              </span>
              <span className="preview-file-path" title={file.path}>
                {file.path}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
