import {
  EntityFromIntegration,
  EntityOperation,
  PersisterClient,
  RelationshipOperation,
} from "@jupiterone/jupiter-managed-integration-sdk";
import { createAccountEntity } from "../converters/AccountEntityConverter";
import { createAccountUserRelationships } from "../converters/AccountUserRelationshipsConverter";
import { createApplicationEntities } from "../converters/ApplicationEntityConverter";
import { createApplicationVulnerabilityRelationships } from "../converters/ApplicationVulnerabilityRelationshipConverter";
import { createAssessmentApplicationRelationships } from "../converters/AssessmentApplicationRelationshipConverter";
import { createAssessmentEntities } from "../converters/AssessmentEntityConverter";
import { createAssessmentVulnerabilityRelationships } from "../converters/AssessmentVulnerabilityRelationshipConverter";
import { createUserAssessmentRelationships } from "../converters/UserAssessmentRelationshipConverter";
import { createUserEntities } from "../converters/UserEntityConverter";
import { createVulnerabilityEntities } from "../converters/VulnerabilityEntityConverter";

import {
  JupiterOneDataModel,
  JupiterOneEntitiesData,
  JupiterOneRelationshipsData,
} from "../jupiterone";

import { Account, TenableDataModel } from "../tenable";

type EntitiesKeys = keyof JupiterOneEntitiesData;
type RelationshipsKeys = keyof JupiterOneRelationshipsData;

export default async function publishChanges(
  persister: PersisterClient,
  oldData: JupiterOneDataModel,
  tenableDataModel: TenableDataModel,
  account: Account,
) {
  const newData = convert(tenableDataModel, account);

  const entities = createEntitiesOperations(
    oldData.entities,
    newData.entities,
    persister,
  );
  const relationships = createRelationshipsOperations(
    oldData.relationships,
    newData.relationships,
    persister,
  );

  return await persister.publishPersisterOperations([entities, relationships]);
}

function createEntitiesOperations(
  oldData: JupiterOneEntitiesData,
  newData: JupiterOneEntitiesData,
  persister: PersisterClient,
): EntityOperation[] {
  const defatultOperations: EntityOperation[] = [];
  const entities: EntitiesKeys[] = Object.keys(oldData) as EntitiesKeys[];

  return entities.reduce((operations, entityName) => {
    const oldEntities = oldData[entityName];
    const newEntities = newData[entityName];

    return [
      ...operations,
      ...persister.processEntities<EntityFromIntegration>(
        oldEntities,
        newEntities,
      ),
    ];
  }, defatultOperations);
}

function createRelationshipsOperations(
  oldData: JupiterOneRelationshipsData,
  newData: JupiterOneRelationshipsData,
  persister: PersisterClient,
): RelationshipOperation[] {
  const defatultOperations: RelationshipOperation[] = [];
  const relationships: RelationshipsKeys[] = Object.keys(
    oldData,
  ) as RelationshipsKeys[];

  return relationships.reduce((operations, relationshipName) => {
    const oldRelationhips = oldData[relationshipName];
    const newRelationhips = newData[relationshipName];

    return [
      ...operations,
      ...persister.processRelationships(oldRelationhips, newRelationhips),
    ];
  }, defatultOperations);
}

export function convert(
  tenableDataModel: TenableDataModel,
  account: Account,
): JupiterOneDataModel {
  return {
    entities: convertEntities(tenableDataModel, account),
    relationships: convertRelationships(tenableDataModel, account),
  };
}

export function convertEntities(
  tenableDataModel: TenableDataModel,
  account: Account,
): JupiterOneEntitiesData {
  return {
    accounts: [createAccountEntity(account)],
    users: createUserEntities(tenableDataModel.users),
    applications: createApplicationEntities(tenableDataModel.assets),
    assessments: createAssessmentEntities(tenableDataModel.scans),
    vulnerabilities: createVulnerabilityEntities(
      tenableDataModel.vulnerabilities,
    ),
  };
}

export function convertRelationships(
  tenableDataModel: TenableDataModel,
  account: Account,
): JupiterOneRelationshipsData {
  return {
    accountUserRelationships: createAccountUserRelationships(
      account,
      tenableDataModel.users,
    ),
    userAssessmentRelationships: createUserAssessmentRelationships(
      tenableDataModel.scans,
      tenableDataModel.users,
    ),
    assessmentVulnerabilityRelationships: createAssessmentVulnerabilityRelationships(
      tenableDataModel.scans,
    ),
    assessmentApplicationRelationships: createAssessmentApplicationRelationships(
      tenableDataModel.scans,
      tenableDataModel.assets,
    ),
    applicationVulnerabilityRelationships: createApplicationVulnerabilityRelationships(
      tenableDataModel.assets,
      tenableDataModel.vulnerabilities,
    ),
  };
}
