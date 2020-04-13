
import * as transform from 'lodash.transform';
import createService, { ServiceConfigs, Service } from './createService';


interface ServicesConfigs {
  [name: string]: ServiceConfigs;
}

export default function<S extends ServicesConfigs>(servicesConfigs: S) {
  const services: { [K in keyof S]: Service<S[K]> } = transform(servicesConfigs, (result, config, namespace) => {
    result[namespace] = createService(config);
  });
  return services;
}
