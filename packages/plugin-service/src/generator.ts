import * as path from 'path';
import * as fse from 'fs-extra';
import * as ejs from 'ejs';
import * as prettier from 'prettier';

export interface IExportData {
  specifier?: string;
  source: string;
  exportName: string;
}

export default class Generator {
  private rootDir: string

  private appServicesTemplatePath: string

  private targetPath: string

  private applyMethod: Function

  constructor({
    rootDir,
    appServicesTemplatePath,
    targetPath,
    applyMethod
  }: {
    rootDir: string;
    appServicesTemplatePath: string;
    targetPath: string;
    applyMethod: Function;
  }) {
    this.rootDir = rootDir;
    this.appServicesTemplatePath = appServicesTemplatePath;
    this.targetPath = targetPath;
    this.applyMethod = applyMethod;
  }


  private renderAppServices() {
    const sourceFilename = 'appServices';
    const exportName = 'services';
    const targetPath = path.join(this.targetPath, `${sourceFilename}.ts`);

    let appServicesDir = path.join(this.rootDir, 'src', 'services');
    let appServices = [];
    if (fse.pathExistsSync(appServicesDir)) {
      appServicesDir = this.applyMethod('formatPath', appServicesDir);
      appServices = fse.readdirSync(appServicesDir).map(item => path.parse(item).name);
    }

    let importStr = '';
    let servicesStr = '';
    appServices.forEach((service) => {
      importStr += `\nimport ${service} from '${appServicesDir}/${service}';`;
      servicesStr += `${service},`;
    });

    this.renderFile(this.appServicesTemplatePath, targetPath, { importStr, servicesStr });
    this.applyMethod('removeIceExport', exportName);
    this.applyMethod('addIceExport', { source: `./${sourceFilename}`, exportName });
  }

  private renderFile(templatePath: string, targetPath: string, extraData = {}) {
    const templateContent = fse.readFileSync(templatePath, 'utf-8');
    let content = ejs.render(templateContent, {...extraData});
    try {
      content = prettier.format(content, {
        parser: 'typescript',
        singleQuote: true
      });
    } catch (error) {
      // ignore error
    }
    fse.ensureDirSync(path.dirname(targetPath));
    fse.writeFileSync(targetPath, content, 'utf-8');
  }

  public render() {
    this.renderAppServices();
  }
}
