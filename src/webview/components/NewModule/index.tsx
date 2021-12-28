import Form from 'webview/components/common/Form/Form';
import Input from 'webview/components/common/Form/Input';
import Select from 'webview/components/common/Form/Select';
import Wrapper from 'webview/components/common/Wrapper/index';
import formClasses from 'webview/components/common/Form/styles.module.scss';
import classNames from 'classnames';
import { useState } from 'preact/hooks';
import { Webview } from 'webview';
import classes from './styles.module.scss';

interface Props {
  vscode: any;
}

const nameValidator = (value: string) => {
  if (!value || value.length < 2) {
    return 'Input is required';
  }

  return false;
};

const NewModule: React.FunctionComponent<Props> = ({ vscode }) => {
  const [error, setError] = useState('');

  const onSubmit = ({ valid, values }: any) => {
    if (valid) {
      vscode.postMessage({ command: 'form', payload: values });
    }
  };

  const onChange = ({ invalid }: any) => {
    if (invalid) {
      setError('Form is invalid');
    }
  };

  return (
    <Webview.Consumer>
      {(data) => {
        return (
          <Wrapper title="Create new Magento module">
            <Form onSubmit={onSubmit} onChange={onChange}>
              <div>{error}</div>
              <div className={classes.form}>
                <Input
                  required
                  name="vendor"
                  label="Vendor*"
                  placeholder="Vendor"
                  validator={nameValidator}
                />
                <Input
                  required
                  name="module"
                  label="Module*"
                  placeholder="Module"
                  validator={nameValidator}
                />
                <Input name="version" label="Setup Version" placeholder="Version" />
                <Select name="sequence" label="Dependencies" multiple>
                  {data.loadedModules.map((mod: string) => {
                    return (
                      <option key={mod} value={mod}>
                        {mod}
                      </option>
                    );
                  })}
                </Select>
                <Select name="license" label="License">
                  <option value="none">No license</option>
                  <option value="gplv3">GPL V3</option>
                  <option value="oslv3">OSL V3</option>
                  <option value="mit">MIT</option>
                  <option value="apache2">Apache2</option>
                </Select>
                <Input name="copyright" label="Copyright" placeholder="Copyright" />
              </div>
              <button className={classNames([formClasses.button, classes.button])} type="submit">
                Submit
              </button>
            </Form>
          </Wrapper>
        );
      }}
    </Webview.Consumer>
  );
};

export default NewModule;
