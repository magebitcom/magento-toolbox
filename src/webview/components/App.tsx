import '@vscode-elements/elements';
import './app.css';
import { useEffect, useState } from 'react';
import Wizard from './Wizard';
import { Command, Page, Wizard as WizardType } from 'types/webview';

const vscode = (window as any).acquireVsCodeApi();

const App: React.FC = () => {
  const [page, setPage] = useState<Page | null>(null);
  const [pageData, setPageData] = useState<WizardType | null>(null);

  useEffect(() => {
    window.addEventListener('message', event => {
      const message = event.data;

      switch (message.command) {
        case Command.ShowWizard:
          setPage(Page.Wizard);
          setPageData(message.data);

          break;
      }
    });

    vscode.postMessage({
      command: Command.Ready,
    });
  }, []);

  return (
    <div className="app">
      {page === Page.Wizard && !!pageData && <Wizard data={pageData} vscode={vscode} />}
    </div>
  );
};

export default App;
