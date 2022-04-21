import { ComponentInstance, ComponentVersionInstance } from './index';
import { ComponentVersion } from '../../src/models';
import { defaultComponentUpdateContent } from './data';

interface UpdateTestComponentOutput {
  component: ComponentInstance;
  version: ComponentVersionInstance;
}

type UpdateTestComponent = (
  component: ComponentInstance,
) => Promise<UpdateTestComponentOutput>;
export const updateTestComponent: UpdateTestComponent = (component) =>
  new Promise((resolve) => {
    const newVersion = {
      componentId: component._id,
      content: component.content,
      name: component.name,
      version: component.version,
      createdOn: new Date(),
      createdBy: component.createdBy,
    };
    ComponentVersion.create(newVersion, (err, version) => {
      if (err) {
        return console.error(err);
      }

      component.version = component.version + 1;
      component.updatedOn = new Date();
      component.updatedBy = component.createdBy;
      component.content = { ...defaultComponentUpdateContent };

      component.save((err, component) => {
        if (err) {
          return console.error(err);
        }

        resolve({ component, version });
      });
    });
  });
