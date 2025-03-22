import { WebviewApi } from 'vscode-webview';
import { Wizard as WizardType } from 'types/webview';
import { Renderer } from './Wizard/Renderer';

interface WizardProps {
  data: WizardType;
  vscode: WebviewApi<unknown>;
}

const Wizard: React.FC<WizardProps> = ({ data, vscode }) => {
  return (
    <div>
      <h1>{data.title}</h1>
      <p>{data.description}</p>
      <br />
      <Renderer wizard={data} vscode={vscode} />
    </div>
  );
};

export default Wizard;
