import { MapNode, MapEdge } from '../store/useCampusStore';

export const CAMPUS_NODES: MapNode[] = [
  // Pavimento 00 (Térreo) - Floor 0
  { id: 'ter-01', name: 'Calçada de Acesso', type: 'entrance', floor: 0, x: 15, y: 88, description: 'Área externa de acesso à unidade pela Rodovia Regis Bittencourt' },
  { id: 'ter-03', name: 'Praça de Acesso', type: 'entrance', floor: 0, x: 30, y: 88, description: 'Ponto de encontro externo e integração' },
  { id: 'ter-10', name: 'Recepção Central', type: 'service', floor: 0, x: 48, y: 70, description: 'Atendimento ao aluno e suporte principal' },
  { id: 'ter-12', name: 'Laboratório 01', type: 'lab', floor: 0, x: 22, y: 14, description: 'Capacidade: 56 alunos | Especializado em Software' },
  { id: 'ter-13', name: 'Laboratório 02', type: 'lab', floor: 0, x: 50, y: 14, description: 'Capacidade: 72 alunos | Montagem e Manutenção' },
  { id: 'ter-14', name: 'Laboratório 03', type: 'lab', floor: 0, x: 78, y: 14, description: 'Capacidade: 80 alunos | Projetos de Redes' },
  { id: 'ter-23', name: 'Core Escadas', type: 'stairs', floor: 0, x: 80, y: 48, description: 'Acesso às áreas de subsolo e pavimentos superiores' },
  { id: 'ter-31', name: 'Core Elevadores', type: 'elevator', floor: 0, x: 35, y: 48, description: 'Elevadores com acesso total a deficientes (PNE)' },
  { id: 'ter-54', name: 'Praça de Alimentação', type: 'service', floor: 0, x: 15, y: 65, description: 'Restaurantes e convivência social' },
  { id: 'ter-58', name: 'Arena Multi-Usos', type: 'audit', floor: 0, x: 14, y: 34, description: 'Auditório para palestras e eventos acadêmicos' },

  // Hidden Waypoints for Orthogonal Routing (Floor 0)
  { id: 'w-spine-reception', x: 50, y: 70, floor: 0, isHidden: true, name: '', type: 'waypoint' },
  { id: 'w-spine-mid', x: 50, y: 48, floor: 0, isHidden: true, name: '', type: 'waypoint' },
  { id: 'w-spine-top', x: 50, y: 30, floor: 0, isHidden: true, name: '', type: 'waypoint' },
  { id: 'w-l1-entry', x: 22, y: 30, floor: 0, isHidden: true, name: '', type: 'waypoint' },
  { id: 'w-l3-entry', x: 78, y: 30, floor: 0, isHidden: true, name: '', type: 'waypoint' },
  { id: 'w-elev-entry', x: 35, y: 48, floor: 0, isHidden: true, name: '', type: 'waypoint' },
  { id: 'w-stairs-entry', x: 80, y: 48, floor: 0, isHidden: true, name: '', type: 'waypoint' },
  { id: 'w-food-entry', x: 15, y: 48, floor: 0, isHidden: true, name: '', type: 'waypoint' },
  { id: 'w-access-entry', x: 30, y: 70, floor: 0, isHidden: true, name: '', type: 'waypoint' },

  // Subsolo -01 - Floor 1
  { id: 'sub1-23', name: 'Escadas [S1]', type: 'stairs', floor: 1, x: 85, y: 55 },
  { id: 'sub1-31', name: 'Elevador [S1]', type: 'elevator', floor: 1, x: 35, y: 50 },
  { id: 'sub1-33', name: 'Sala 06', type: 'room', floor: 1, x: 25, y: 20, description: 'Capacidade: 63 alunos' },
  { id: 'sub1-34', name: 'Sala 07', type: 'room', floor: 1, x: 75, y: 20, description: 'Capacidade: 63 alunos' },
  { id: 'sub1-58', name: 'Food Court', type: 'service', floor: 1, x: 50, y: 85, description: 'Lanchonete 01' },

  // Subsolo -02 - Floor 2
  { id: 'sub2-23', name: 'Escadas [S2]', type: 'stairs', floor: 2, x: 85, y: 55 },
  { id: 'sub2-31', name: 'Elevador [S2]', type: 'elevator', floor: 2, x: 35, y: 50 },
  { id: 'sub2-42', name: 'Área Gamer', type: 'service', floor: 2, x: 20, y: 20, description: 'Espaço de lazer e gaming do campus' },
  { id: 'sub2-45', name: 'Sala 10', type: 'room', floor: 2, x: 50, y: 20, description: 'Capacidade: 60 alunos' },
  { id: 'sub2-53', name: 'Estacionamento', type: 'service', floor: 2, x: 50, y: 85, description: 'Acesso privativo e vagas rotativas' },
  { id: 'totem-base', name: 'Ponto de Partida', type: 'service', floor: 0, x: 68, y: 92, description: 'Totem de Atendimento UniFECAF' },
];

export const CAMPUS_EDGES: MapEdge[] = [
  // Orthogonal Floor 0 Routing - Following the Gray Dashed Blueprint
  { from: 'totem-base', to: 'w-spine-reception', weight: 0.1 },
  { from: 'w-spine-reception', to: 'ter-10', weight: 0.05 },
  
  // Central vertical spine
  { from: 'w-spine-reception', to: 'w-spine-mid', weight: 0.3 },
  { from: 'w-spine-mid', to: 'w-spine-top', weight: 0.2 },
  { from: 'w-spine-top', to: 'ter-13', weight: 0.15 }, // direct up to Lab 2
  
  // Middle horizontal corridor (y=48)
  { from: 'w-spine-mid', to: 'w-elev-entry', weight: 0.15 },
  { from: 'w-elev-entry', to: 'ter-31', weight: 0.05 },
  { from: 'w-spine-mid', to: 'w-stairs-entry', weight: 0.3 },
  { from: 'w-stairs-entry', to: 'ter-23', weight: 0.05 },
  { from: 'w-spine-mid', to: 'w-food-entry', weight: 0.35 },
  { from: 'w-food-entry', to: 'ter-54', weight: 0.15 },
  
  // Top horizontal corridor (y=30)
  { from: 'w-spine-top', to: 'w-l1-entry', weight: 0.28 },
  { from: 'w-l1-entry', to: 'ter-12', weight: 0.15 }, // Lab 1 vertical entry
  { from: 'w-l1-entry', to: 'ter-58', weight: 0.05 }, // Arena vertical entry
  
  { from: 'w-spine-top', to: 'w-l3-entry', weight: 0.28 },
  { from: 'w-l3-entry', to: 'ter-14', weight: 0.15 },
  
  // Access Praça
  { from: 'w-spine-reception', to: 'w-access-entry', weight: 0.2 },
  { from: 'w-access-entry', to: 'ter-03', weight: 0.1 },
  { from: 'ter-03', to: 'ter-01', weight: 0.15 },

  // Vales Verticais (Stairs/Elevators)
  { from: 'ter-23', to: 'sub1-23', weight: 1 },
  { from: 'sub1-23', to: 'sub2-23', weight: 1 },
  { from: 'ter-31', to: 'sub1-31', weight: 1 },
  { from: 'sub1-31', to: 'sub2-31', weight: 1 },

  // Sub Flow (Simplified for now)
  { from: 'sub1-31', to: 'sub1-33', weight: 1 },
  { from: 'sub1-23', to: 'sub1-34', weight: 1 },
  { from: 'sub1-23', to: 'sub1-58', weight: 1 },
  { from: 'sub2-31', to: 'sub2-42', weight: 1 },
  { from: 'sub2-23', to: 'sub2-45', weight: 1 },
  { from: 'sub2-23', to: 'sub2-53', weight: 1 },
];

/**
 * Dijkstra's algorithm for accurate shortest path
 */
export function findPath(startId: string, endId: string): string[] | null {
  const distances: { [key: string]: number } = {};
  const previous: { [key: string]: string | null } = {};
  const nodes = new Set<string>();

  CAMPUS_NODES.forEach(node => {
    distances[node.id] = Infinity;
    previous[node.id] = null;
    nodes.add(node.id);
  });

  distances[startId] = 0;

  while (nodes.size > 0) {
    let closestNodeId: string | null = null;
    nodes.forEach(nodeId => {
      if (closestNodeId === null || distances[nodeId] < distances[closestNodeId]) {
        closestNodeId = nodeId;
      }
    });

    if (!closestNodeId || distances[closestNodeId] === Infinity) break;
    if (closestNodeId === endId) break;

    nodes.delete(closestNodeId);

    const neighbors = CAMPUS_EDGES.filter(e => e.from === closestNodeId || e.to === closestNodeId);
    
    neighbors.forEach(edge => {
      const neighborId = edge.from === closestNodeId ? edge.to : edge.from;
      if (!nodes.has(neighborId)) return;

      const alt = distances[closestNodeId!] + edge.weight;
      if (alt < distances[neighborId]) {
        distances[neighborId] = alt;
        previous[neighborId] = closestNodeId;
      }
    });
  }

  const path: string[] = [];
  let current: string | null = endId;
  
  if (previous[current] === null && current !== startId) return null;

  while (current !== null) {
    path.unshift(current);
    current = previous[current];
  }

  return path;
}
