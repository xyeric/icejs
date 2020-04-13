import * as path from 'path';
import * as fse from 'fs-extra';
import Generator from './generator';

export default async (api) => {
  const { context, getValue, onHook, applyMethod, onGetWebpackConfig } = api;
  const { rootDir } = context;

  const srcPath = path.join(__dirname, 'service');
  const distPath = path.join(getValue('ICE_TEMP'), 'service');

  // move requst to .ice/request
  await fse.copy(srcPath, distPath);
  applyMethod('addIceExport', { source: './service/createService', exportName: 'createService' });
  applyMethod('addIceExport', { source: './service/createServices', exportName: 'createServices' });

  const targetPath = getValue('ICE_TEMP');
  const templatePath = path.join(__dirname, 'template');
  const appServicesTemplatePath = path.join(templatePath, 'appServices.ts.ejs');

  onGetWebpackConfig(config => {
    config.resolve.alias.set('$ice/createService', path.join(distPath, 'create.ts'));
    config.resolve.alias.set('$ice/appServices', path.join(targetPath, 'appServices.ts'));
  });

  const gen = new Generator({
    appServicesTemplatePath,
    targetPath,
    rootDir,
    applyMethod,
  });

  gen.render();
  onHook('before.start.run', async () => {
    applyMethod('watchFileChange', /services\/.*/, () => {
      gen.render();
    });
  });
};

