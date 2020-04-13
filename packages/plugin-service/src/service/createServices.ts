
import * as transform from 'lodash.transform';
import createService, { Configs, Service } from './createService';


interface AllConfigs {
  [key: string]: Configs;
}

export default function<A extends AllConfigs>(allConfigs: A) {
  const services: { [K in keyof A]: Service<A[K]> } = transform(allConfigs, (result, config, namespace) => {
    result[namespace] = createService(config);
  });
  return services;
}
