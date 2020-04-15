import * as path from 'path';
import * as fse from 'fs-extra';

export default async (api) => {
  const { getValue, applyMethod, onGetWebpackConfig } = api;

  const srcPath = path.join(__dirname, 'service');
  const distPath = path.join(getValue('ICE_TEMP'), 'service');

  // move service to .ice/service
  await fse.copy(srcPath, distPath);
  applyMethod('addIceExport', { source: './service/create', exportName: 'createService' });

  onGetWebpackConfig(config => {
    config.resolve.alias.set('$ice/service/create', path.join(distPath, 'create.ts'));
  });
};

