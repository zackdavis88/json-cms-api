import { BlueprintInstance, BlueprintVersionInstance } from './index';
import { BlueprintVersion } from '../../src/models';
import { blueprintUpdatePayload } from './data';

interface UpdateTestBlueprintOutput {
  blueprint: BlueprintInstance;
  version: BlueprintVersionInstance;
}

type UpdateTestBlueprint = (
  blueprint: BlueprintInstance,
) => Promise<UpdateTestBlueprintOutput>;
export const updateTestBlueprint: UpdateTestBlueprint = (blueprint) =>
  new Promise((resolve) => {
    const newVersion = {
      blueprintId: blueprint._id,
      fields: blueprint.fields,
      name: blueprint.name,
      version: blueprint.version,
      createdOn: new Date(),
      createdBy: blueprint.createdBy,
    };
    BlueprintVersion.create(newVersion, (err, version) => {
      if (err) {
        return console.error(err);
      }

      blueprint.version = blueprint.version + 1;
      blueprint.updatedOn = new Date();
      blueprint.updatedBy = blueprint.createdBy;
      blueprint.fields = blueprintUpdatePayload.fields;

      blueprint.save((err, blueprint) => {
        if (err) {
          return console.error(err);
        }

        resolve({ blueprint, version });
      });
    });
  });
