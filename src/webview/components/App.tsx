import '@vscode-elements/elements';
import './app.css';
import { useEffect, useState } from 'react';
import Wizard from './Wizard';
import { Command, Page, PreviewResult, Wizard as WizardType, WizardAssets } from 'types/webview';

const vscode = (window as any).acquireVsCodeApi();

const App: React.FC = () => {
  const [page, setPage] = useState<Page | null>(null);
  const [pageData, setPageData] = useState<WizardType | null>(null);
  const [assets, setAssets] = useState<WizardAssets | null>(null);
  const [preview, setPreview] = useState<PreviewResult | null>(null);

  useEffect(() => {
    window.addEventListener('message', event => {
      const message = event.data;

      switch (message.command) {
        case Command.ShowWizard:
          setPage(Page.Wizard);
          setPageData(message.data);
          setAssets(message.assets ?? null);
          break;
        case Command.PreviewResult:
          setPreview(message.data as PreviewResult);
          break;
      }
    });

    vscode.postMessage({
      command: Command.Ready,
    });
  }, []);

  return (
    <div className="app">
      {page === Page.Wizard && !!pageData && (
        <Wizard data={pageData} assets={assets} preview={preview} vscode={vscode} />
      )}
    </div>
  );
};

export default App;
