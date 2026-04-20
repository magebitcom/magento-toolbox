import { WebviewApi } from 'vscode-webview';
import { Command, PreviewResult, Wizard as WizardType, WizardAssets } from 'types/webview';
import { Renderer } from './Wizard/Renderer';

interface WizardProps {
  data: WizardType;
  assets: WizardAssets | null;
  preview: PreviewResult | null;
  vscode: WebviewApi<unknown>;
}

const Wizard: React.FC<WizardProps> = ({ data, assets, preview, vscode }) => {
  const handleSwitch = () => {
    vscode.postMessage({ command: Command.ShowSwitcher });
  };

  return (
    <div className="wizard">
      <header className="wizard-header">
        <div className="wizard-brand">
          {assets?.logoUri && (
            <img className="wizard-logo" src={assets.logoUri} alt="Magento Toolbox" />
          )}
          <span className="wizard-brand-name">Magento Toolbox</span>
          <button
            type="button"
            className="wizard-switch"
            onClick={handleSwitch}
            title="Switch to a different generator"
          >
            Switch generator…
          </button>
        </div>
        <h1>{data.title}</h1>
        {data.description && <p>{data.description}</p>}
      </header>
      <Renderer wizard={data} preview={preview} vscode={vscode} />
    </div>
  );
};

export default Wizard;
