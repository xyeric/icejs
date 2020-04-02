import { IPlugin } from '@alib/build-scripts';

const plugin: IPlugin = async ({ getValue, onGetWebpackConfig }): Promise<void> => {
  const ICE_TEMP = getValue('ICE_TEMP');

  onGetWebpackConfig((config) => {

  });
};

export default plugin;
