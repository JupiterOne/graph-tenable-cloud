import {
  CONTAINER_ENTITY_CLASS,
  CONTAINER_ENTITY_TYPE,
  ContainerEntity,
} from "../jupiterone/entities";
import { Container } from "../tenable/types";
import { generateEntityKey } from "../utils/generateKey";
import getTime from "../utils/getTime";

export function createContainerEntities(data: Container[]): ContainerEntity[] {
  return data.map((container) => {
    const containerEntity: ContainerEntity = {
      _key: generateEntityKey(CONTAINER_ENTITY_TYPE, container.id),
      _type: CONTAINER_ENTITY_TYPE,
      _class: CONTAINER_ENTITY_CLASS,
      _rawData: [{ name: "default", rawData: container }],
      id: container.id,
      repoId: container.repo_id,
      platform: container.platform,
      name: container.name,
      size: container.size,
      digest: container.digest,
      repoName: container.repo_name,
      score: container.score,
      status: container.status,
      createdAt: getTime(container.created_at)!,
      updatedAt: getTime(container.updated_at)!,
      numberOfVulnerabilities: container.number_of_vulnerabilities,
    };
    return containerEntity;
  });
}
