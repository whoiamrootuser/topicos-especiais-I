import { VisualStep } from '../types';

/**
 * Utilitário para gerar os passos de animação das estruturas simultaneamente,
 * de acordo com a operação escolhida e o estado atual da lista.
 */
export function generateSteps(
  currentValues: string[],
  operation: { type: string; value?: string; index?: number }
): VisualStep[] {
  const steps: VisualStep[] = [];
  const initialValues = [...currentValues];
  const capacity = 8; // Capacidade base do ArrayList
  
  const createArrayListState = (
    values: string[],
    highlightedIndices: number[] = [],
    movingIndex?: { from: number; to: number },
    newValueIndex?: number
  ) => {
    const cells = Array.from({ length: capacity }, (_, i) => {
      const val = values[i] !== undefined ? values[i] : '';
      const isHighlighted = highlightedIndices.includes(i);
      const isNew = newValueIndex === i;
      const isMoving = movingIndex?.from === i || movingIndex?.to === i;
      return {
        value: val,
        isHighlighted,
        isNew,
        isMoving,
        originalIndex: i,
      };
    });

    return {
      cells,
      capacity,
      headIndex: 0,
      size: values.length,
    };
  };

  const createLinkedListState = (
    values: string[],
    highlightedIds: string[] = [],
    newVal?: { value: string; id: string; targetNextId: string | null; isNew: boolean },
    activePointer?: { from: string; to: string | null; label: string } | null
  ) => {
    // Nós normais de 0 a n
    const nodes = values.map((val, idx) => {
      const id = `node-${val}-${idx}`;
      return {
        id,
        value: val,
        isHighlighted: highlightedIds.includes(id),
        nextId: idx < values.length - 1 ? `node-${values[idx + 1]}-${idx + 1}` : null,
      };
    });

    // Se houver um novo nó flutuando ou em criação antes de ser vinculado
    if (newVal) {
      nodes.push({
        id: newVal.id,
        value: newVal.value,
        isHighlighted: true,
        nextId: newVal.targetNextId,
        isNew: true,
      } as any);
    }

    const headId = nodes.length > 0 && !(newVal && newVal.isNew && values.length === 0) 
      ? nodes[0].id 
      : (newVal ? newVal.id : null);

    return {
      nodes,
      headId: values.length > 0 ? nodes[0].id : (newVal ? newVal.id : null),
      activePointer,
    };
  };

  // 1. INSERÇÃO NO INÍCIO
  if (operation.type === 'insert_head') {
    const newVal = operation.value || 'X';
    const newId = `node-${newVal}-new`;

    // PASSO 1: Estado Inicial & Criação de Nó
    steps.push({
      description: `Iniciamos a inserção de '${newVal}' no início (índice 0). Criamos o novo nó na LinkedList e verificamos a capacidade no ArrayList.`,
      arrayListState: createArrayListState(initialValues),
      linkedListState: createLinkedListState(initialValues, [], {
        value: newVal,
        id: newId,
        targetNextId: null,
        isNew: true,
      }, null),
    });

    // Verificação de capacidade e redimensionamento caso atinja o limite do ArrayList
    if (initialValues.length >= capacity) {
      // ArrayList precisa dobrar de tamanho
      steps.push({
        description: `⚠️ ALERTA: O ArrayList atingiu o limite de capacidade (${capacity}). Criamos um novo bloco na memória com capacidade duplicada (16) para começar a copiar os dados. O custo de redimensionar é O(N).`,
        arrayListState: createArrayListState(initialValues, Array.from({ length: initialValues.length }, (_, i) => i)),
        linkedListState: createLinkedListState(initialValues, [], {
          value: newVal,
          id: newId,
          targetNextId: null,
          isNew: true,
        }, null),
      });
    }

    // PASSO 2: ArrayList precisa arrastar elementos da direita para a esquerda (começando da cauda)
    // Mostramos o deslocamento um por um ou em blocos para não ficar cansativo
    const arrStateShift = [...initialValues];
    const n = arrStateShift.length;

    for (let i = n - 1; i >= 0; i--) {
      arrStateShift[i + 1] = arrStateShift[i];
      arrStateShift[i] = ''; // vaga liberada temporariamente
      steps.push({
        description: `[ArrayList] Deslocando elemento '${arrStateShift[i + 1]}' do índice ${i} para o índice ${i + 1} para abrir espaço no início.`,
        arrayListState: createArrayListState(arrStateShift, [i + 1], { from: i, to: i + 1 }),
        linkedListState: createLinkedListState(initialValues, [], {
          value: newVal,
          id: newId,
          targetNextId: null,
          isNew: true,
        }, null),
      });
    }

    // LADO DA LINKED LIST: Apontar next do novo nó para a antiga cabeça
    const oldHeadId = initialValues.length > 0 ? `node-${initialValues[0]}-0` : null;
    steps.push({
      description: `[LinkedList] Estabelecemos a conexão: o ponteiro 'next' do novo nó '${newVal}' passa a apontar para a antiga cabeça da lista ('${initialValues[0] || 'NULL'}').`,
      arrayListState: createArrayListState(arrStateShift),
      linkedListState: createLinkedListState(initialValues, [newId], {
        value: newVal,
        id: newId,
        targetNextId: oldHeadId,
        isNew: false,
      }, { from: newId, to: oldHeadId, label: 'next' }),
    });

    // PASSO FINAL: Atualizar cabeça na LinkedList e Inserir no índice 0 no ArrayList
    const finalValues = [newVal, ...initialValues];
    steps.push({
      description: `[Concluído] ArrayList grava '${newVal}' no índice 0. LinkedList redefine o ponteiro principal de início (head) para o novo nó '${newVal}'. Inserção completa!`,
      arrayListState: createArrayListState(finalValues, [0], undefined, 0),
      linkedListState: createLinkedListState(finalValues, [`node-${newVal}-0`], undefined, {
        from: 'HEAD',
        to: `node-${newVal}-0`,
        label: 'head',
      }),
    });
  }

  // 2. INSERÇÃO NO FIM
  else if (operation.type === 'insert_tail') {
    const newVal = operation.value || 'X';
    const newId = `node-${newVal}-new`;
    const lastIdx = initialValues.length - 1;
    const lastNodeId = lastIdx >= 0 ? `node-${initialValues[lastIdx]}-${lastIdx}` : null;

    steps.push({
      description: `Iniciamos a inserção de '${newVal}' no final (índice ${initialValues.length}). Criamos o nó para a LinkedList e verificamos espaço no ArrayList.`,
      arrayListState: createArrayListState(initialValues),
      linkedListState: createLinkedListState(initialValues, [], {
        value: newVal,
        id: newId,
        targetNextId: null,
        isNew: true,
      }),
    });

    // ArrayList: escreve diretamente no índice correspondente ao tamanho
    steps.push({
      description: `[ArrayList] Grava diretamente '${newVal}' na próxima posição vaga de memória (${initialValues.length}) sem necessidade de deslocamento de outros itens. Operação O(1).`,
      arrayListState: createArrayListState([...initialValues, newVal], [initialValues.length], undefined, initialValues.length),
      linkedListState: createLinkedListState(initialValues, [], {
        value: newVal,
        id: newId,
        targetNextId: null,
        isNew: true,
      }),
    });

    // LinkedList: liga o último nó de cauda (tail) para o novo nó
    if (lastNodeId) {
      steps.push({
        description: `[LinkedList] O nó final atual '${initialValues[lastIdx]}' altera seu link 'next' do valor nulo (NULL) para apontar diretamente para o novo nó '${newVal}'.`,
        arrayListState: createArrayListState([...initialValues, newVal]),
        linkedListState: createLinkedListState(initialValues, [lastNodeId], {
          value: newVal,
          id: newId,
          targetNextId: null,
          isNew: false,
        }, { from: lastNodeId, to: newId, label: 'next' }),
      });
    }

    const finalValues = [...initialValues, newVal];
    steps.push({
      description: `[Concluído] Ambas as estruturas foram atualizadas de forma muito eficiente. Custo O(1).`,
      arrayListState: createArrayListState(finalValues, [finalValues.length - 1]),
      linkedListState: createLinkedListState(finalValues, [`node-${newVal}-${finalValues.length - 1}`]),
    });
  }

  // 3. INSERÇÃO NO MEIO (ÍNDICE ESPECIFICADO)
  else if (operation.type === 'insert_index') {
    const newVal = operation.value || 'X';
    const targetIdx = operation.index !== undefined ? operation.index : 2;
    const clampedIdx = Math.max(0, Math.min(initialValues.length, targetIdx));
    const newId = `node-${newVal}-new`;

    // PASSO 1: Estado Inicial e Criação de Nó
    steps.push({
      description: `Iniciamos a inserção de '${newVal}' no índice ${clampedIdx}. Criamos o nó na LinkedList.`,
      arrayListState: createArrayListState(initialValues),
      linkedListState: createLinkedListState(initialValues, [], {
        value: newVal,
        id: newId,
        targetNextId: null,
        isNew: true,
      }),
    });

    // PASSO 2: LinkedList precisa caminhar do início até o nó anterior ao índice desejado
    const traversalIds: string[] = [];
    for (let i = 0; i < clampedIdx; i++) {
      const nodeId = `node-${initialValues[i]}-${i}`;
      traversalIds.push(nodeId);
      steps.push({
        description: `[LinkedList] Navegando pelos nós para encontrar o índice desejado. Nó atual visitado: '${initialValues[i]}' no índice ${i}. (Total de passos de ponteiro até aqui: ${i + 1})`,
        arrayListState: createArrayListState(initialValues),
        linkedListState: createLinkedListState(initialValues, [...traversalIds], {
          value: newVal,
          id: newId,
          targetNextId: null,
          isNew: true,
        }, {
          from: nodeId,
          to: i < initialValues.length - 1 ? `node-${initialValues[i + 1]}-${i + 1}` : null,
          label: 'traverse',
        }),
      });
    }

    // PASSO 3: ArrayList desloca elementos posteriores à direita (começando da cauda)
    const arrStateShift = [...initialValues];
    const n = arrStateShift.length;
    for (let i = n - 1; i >= clampedIdx; i--) {
      arrStateShift[i + 1] = arrStateShift[i];
      arrStateShift[i] = '';
      steps.push({
        description: `[ArrayList] Deslocando elemento '${arrStateShift[i + 1]}' do índice ${i} para ${i + 1} para abrir vaga no índice ${clampedIdx}.`,
        arrayListState: createArrayListState(arrStateShift, [i + 1], { from: i, to: i + 1 }),
        linkedListState: createLinkedListState(initialValues, [...traversalIds], {
          value: newVal,
          id: newId,
          targetNextId: null,
          isNew: true,
        }),
      });
    }

    // PASSO 4: LinkedList faz o novo nó apontar para o nó que ocupará a posição à frente
    const nextNodeId = clampedIdx < initialValues.length ? `node-${initialValues[clampedIdx]}-${clampedIdx}` : null;
    steps.push({
      description: `[LinkedList] O 'next' do novo nó '${newVal}' é vinculado para o nó que estava no índice ${clampedIdx}: '${initialValues[clampedIdx] || 'NULL'}'.`,
      arrayListState: createArrayListState(arrStateShift),
      linkedListState: createLinkedListState(initialValues, [...traversalIds], {
        value: newVal,
        id: newId,
        targetNextId: nextNodeId,
        isNew: false,
      }, { from: newId, to: nextNodeId, label: 'next' }),
    });

    // PASSO 5: Vincular o nó anterior ao novo nó
    if (clampedIdx > 0) {
      const prevNodeId = `node-${initialValues[clampedIdx - 1]}-${clampedIdx - 1}`;
      steps.push({
        description: `[LinkedList] O nó anterior '${initialValues[clampedIdx - 1]}' (índice ${clampedIdx - 1}) atualiza seu ponteiro 'next' mudando do antigo próximo para apontar para o novo nó '${newVal}'.`,
        arrayListState: createArrayListState(arrStateShift),
        linkedListState: createLinkedListState(initialValues, [prevNodeId], {
          value: newVal,
          id: newId,
          targetNextId: nextNodeId,
          isNew: false,
        }, { from: prevNodeId, to: newId, label: 'next' }),
      });
    }

    // PASSO FINAL: Gravar novo valor no ArrayList e Concluir
    const finalValues = [...initialValues];
    finalValues.splice(clampedIdx, 0, newVal);
    steps.push({
      description: `[Concluído] Novo elemento '${newVal}' foi gravado com sucesso no índice ${clampedIdx} de ambas as estruturas!`,
      arrayListState: createArrayListState(finalValues, [clampedIdx], undefined, clampedIdx),
      linkedListState: createLinkedListState(finalValues, [`node-${newVal}-${clampedIdx}`]),
    });
  }

  // 4. REMOÇÃO NO INÍCIO
  else if (operation.type === 'remove_head') {
    if (initialValues.length === 0) {
      steps.push({
        description: 'A lista já está vazia. Nenhuma remoção pode ser feita.',
        arrayListState: createArrayListState([]),
        linkedListState: createLinkedListState([]),
      });
    } else {
      const removedVal = initialValues[0];
      const removedId = `node-${removedVal}-0`;

      // PASSO 1: Destacar Cabeça
      steps.push({
        description: `Removendo elemento no início (índice 0). Para a LinkedList, basta mudar o ponteiro 'head' para o segundo nó. Para o ArrayList, precisaremos mover todos.`,
        arrayListState: createArrayListState(initialValues, [0]),
        linkedListState: createLinkedListState(initialValues, [removedId]),
      });

      // PASSO 2: LinkedList muda cabeça
      const secondNodeId = initialValues.length > 1 ? `node-${initialValues[1]}-1` : null;
      steps.push({
        description: `[LinkedList] Desvincula o primeiro nó. A nova 'head' agora aponta diretamente para o segundo nó '${initialValues[1] || 'NULL'}'. O antigo primeiro nó é liberado pelo coletor de lixo (Garbage Collector) em O(1).`,
        arrayListState: createArrayListState(initialValues, [0]),
        linkedListState: createLinkedListState(initialValues, [], undefined, {
          from: 'HEAD',
          to: secondNodeId,
          label: 'head',
        }),
      });

      // PASSO 3: ArrayList desloca elementos à esquerda para compactar a memória
      const arrStateShift = [...initialValues];
      const n = arrStateShift.length;
      for (let i = 1; i < n; i++) {
        arrStateShift[i - 1] = arrStateShift[i];
        arrStateShift[i] = '';
        steps.push({
          description: `[ArrayList] Puxando elemento '${arrStateShift[i - 1]}' do índice ${i} para a esquerda no índice ${i - 1}.`,
          arrayListState: createArrayListState(arrStateShift, [i - 1], { from: i, to: i - 1 }),
          linkedListState: createLinkedListState(initialValues.slice(1)),
        });
      }

      // PASSO FINAL: Finalizados
      const finalValues = initialValues.slice(1);
      steps.push({
        description: `[Concluído] Remoção no início finalizada. ArrayList teve custo O(N) devido aos deslocamentos de memória, enquanto LinkedList concluiu em O(1).`,
        arrayListState: createArrayListState(finalValues),
        linkedListState: createLinkedListState(finalValues),
      });
    }
  }

  // 5. REMOÇÃO NO FIM
  else if (operation.type === 'remove_tail') {
    if (initialValues.length === 0) {
      steps.push({
        description: 'A lista já está vazia.',
        arrayListState: createArrayListState([]),
        linkedListState: createLinkedListState([]),
      });
    } else {
      const lastIdx = initialValues.length - 1;
      const lastVal = initialValues[lastIdx];
      const lastNodeId = `node-${lastVal}-${lastIdx}`;

      // PASSO 1: Selecionar o último elemento
      steps.push({
        description: `Removendo o último elemento '${lastVal}' no índice ${lastIdx}. No ArrayList ele é deletado diretamente dadas as dimensões. Na LinkedList precisaremos achar o nó anterior.`,
        arrayListState: createArrayListState(initialValues, [lastIdx]),
        linkedListState: createLinkedListState(initialValues, [lastNodeId]),
      });

      // PASSO 2: ArrayList remove instantaneamente mudando a variável de tamanho
      const arrayRemovedValues = initialValues.slice(0, -1);
      steps.push({
        description: `[ArrayList] Simplesmente exclui o último valor (índice ${lastIdx}) ou reduz as dimensões 'size' de ${initialValues.length} para ${lastIdx}. Sem deslocamento! Operação O(1).`,
        arrayListState: createArrayListState(arrayRemovedValues),
        linkedListState: createLinkedListState(initialValues, [lastNodeId]),
      });

      // PASSO 3: LinkedList percorre nós até encontrar o penúltimo nó para definir como cauda
      const traversalIds: string[] = [];
      for (let i = 0; i < lastIdx; i++) {
        const nodeId = `node-${initialValues[i]}-${i}`;
        traversalIds.push(nodeId);
        steps.push({
          description: `[LinkedList] Caminhando para localizar o penúltimo nó. Visitando nó '${initialValues[i]}' no índice ${i}.`,
          arrayListState: createArrayListState(arrayRemovedValues),
          linkedListState: createLinkedListState(initialValues, [...traversalIds], undefined, {
            from: nodeId,
            to: i < initialValues.length - 1 ? `node-${initialValues[i + 1]}-${i + 1}` : null,
            label: 'traverse',
          }),
        });
      }

      // PASSO 4: Romper conexão
      if (lastIdx > 0) {
        const preLastNodeId = `node-${initialValues[lastIdx - 1]}-${lastIdx - 1}`;
        steps.push({
          description: `[LinkedList] O penúltimo nó '${initialValues[lastIdx - 1]}' (índice ${lastIdx - 1}) altera seu ponteiro 'next' de '${lastVal}' para 'NULL' (fim de lista).`,
          arrayListState: createArrayListState(arrayRemovedValues),
          linkedListState: createLinkedListState(initialValues.slice(0, -1), [preLastNodeId], undefined, {
            from: preLastNodeId,
            to: null,
            label: 'next',
          }),
        });
      }

      const finalValues = initialValues.slice(0, -1);
      // PASSO FINAL
      steps.push({
        description: `[Concluído] Remoção do último elemento concluída!`,
        arrayListState: createArrayListState(finalValues),
        linkedListState: createLinkedListState(finalValues),
      });
    }
  }

  // 6. REMOÇÃO NO ÍNDICE MEIO
  else if (operation.type === 'remove_index') {
    const targetIdx = operation.index !== undefined ? operation.index : 2;
    const clampedIdx = Math.max(0, Math.min(initialValues.length - 1, targetIdx));

    if (initialValues.length === 0) {
      steps.push({
        description: 'Lista vazia.',
        arrayListState: createArrayListState([]),
        linkedListState: createLinkedListState([]),
      });
    } else {
      const removedVal = initialValues[clampedIdx];
      const targetNodeId = `node-${removedVal}-${clampedIdx}`;

      // PASSO 1: Focar no alvo
      steps.push({
        description: `Iniciamos a remoção do elemento '${removedVal}' no índice ${clampedIdx}.`,
        arrayListState: createArrayListState(initialValues, [clampedIdx]),
        linkedListState: createLinkedListState(initialValues, [targetNodeId]),
      });

      // PASSO 2: LinkedList precisa encontrar os nós vizinhos (nó de índice cadastrado e anterior)
      const traversalIds: string[] = [];
      const stepsToFind = clampedIdx; // busca o anterior
      for (let i = 0; i < stepsToFind; i++) {
        const nodeId = `node-${initialValues[i]}-${i}`;
        traversalIds.push(nodeId);
        steps.push({
          description: `[LinkedList] Navegando pelos nós visitando '${initialValues[i]}' até achar o nó anterior ao que será excluído (índice ${clampedIdx - 1}).`,
          arrayListState: createArrayListState(initialValues, [clampedIdx]),
          linkedListState: createLinkedListState(initialValues, [...traversalIds, targetNodeId], undefined, {
            from: nodeId,
            to: `node-${initialValues[i + 1]}-${i + 1}`,
            label: 'traverse',
          }),
        });
      }

      // PASSO 3: LinkedList pula o nó a ser removido (aponta prev.next = current.next)
      if (clampedIdx > 0) {
        const prevNodeId = `node-${initialValues[clampedIdx - 1]}-${clampedIdx - 1}`;
        const nextNodeId = clampedIdx < initialValues.length - 1 ? `node-${initialValues[clampedIdx + 1]}-${clampedIdx + 1}` : null;
        steps.push({
          description: `[LinkedList] Pulamos o nó de exclusão. O nó anterior '${initialValues[clampedIdx - 1]}' ajusta seu 'next' para apontar diretamente para '${initialValues[clampedIdx + 1] || 'NULL'}', desvinculando '${removedVal}'.`,
          arrayListState: createArrayListState(initialValues, [clampedIdx]),
          linkedListState: createLinkedListState(initialValues, [prevNodeId, targetNodeId], undefined, {
            from: prevNodeId,
            to: nextNodeId,
            label: 'next',
          }),
        });
      } else {
        // Se for o índice 0, fazemos como remove_head
        const secondNodeId = initialValues.length > 1 ? `node-${initialValues[1]}-1` : null;
        steps.push({
          description: `[LinkedList] Como o índice é 0, a cabeceira 'head' é alterada para apontar para o segundo nó '${initialValues[1] || 'NULL'}'.`,
          arrayListState: createArrayListState(initialValues, [0]),
          linkedListState: createLinkedListState(initialValues, [targetNodeId], undefined, {
            from: 'HEAD',
            to: secondNodeId,
            label: 'head',
          }),
        });
      }

      // PASSO 4: ArrayList começa a compactar os blocos posteriores reposicionando à esquerda
      const arrStateShift = [...initialValues];
      const n = arrStateShift.length;
      for (let i = clampedIdx + 1; i < n; i++) {
        arrStateShift[i - 1] = arrStateShift[i];
        arrStateShift[i] = '';
        steps.push({
          description: `[ArrayList] Copiando elemento '${arrStateShift[i - 1]}' do índice ${i} para a esquerda no índice ${i - 1}.`,
          arrayListState: createArrayListState(arrStateShift, [i - 1], { from: i, to: i - 1 }),
          linkedListState: createLinkedListState(initialValues.filter((_, idx) => idx !== clampedIdx)),
        });
      }

      const finalValues = initialValues.filter((_, idx) => idx !== clampedIdx);
      steps.push({
        description: `[Concluído] O elemento '${removedVal}' foi removido com sucesso de ambas as listas.`,
        arrayListState: createArrayListState(finalValues),
        linkedListState: createLinkedListState(finalValues),
      });
    }
  }

  // 7. BUSCA POR VALOR
  else if (operation.type === 'search') {
    const searchVal = operation.value || 'C';
    let foundIndex = -1;

    steps.push({
      description: `Iniciamos a busca sequencial pelo valor '${searchVal}'. Ambas as estruturas precisarão varrer os elementos a partir do início.`,
      arrayListState: createArrayListState(initialValues),
      linkedListState: createLinkedListState(initialValues),
    });

    // Varrendo um a um, comparando
    const maxLen = initialValues.length;
    for (let i = 0; i < maxLen; i++) {
      const match = initialValues[i] === searchVal;
      const stepDescription = match
        ? `[Encontrado!] O elemento no índice ${i} (${initialValues[i]}) coincide com o buscado '${searchVal}'.`
        : `Analisando elemento no índice ${i} (${initialValues[i]}). Não corresponde a '${searchVal}'. Continuamos a busca.`;
      
      const nodeId = `node-${initialValues[i]}-${i}`;
      steps.push({
        description: stepDescription,
        arrayListState: createArrayListState(initialValues, [i]),
        linkedListState: createLinkedListState(initialValues, [nodeId], undefined, {
          from: nodeId,
          to: i < maxLen - 1 ? `node-${initialValues[i + 1]}-${i + 1}` : null,
          label: 'search',
        }),
      });

      if (match) {
        foundIndex = i;
        break;
      }
    }

    if (foundIndex === -1) {
      steps.push({
        description: `[Falha] O valor '${searchVal}' não foi encontrado na lista. Varremos toda a estrutura (Complexidade O(N)) sem sucesso.`,
        arrayListState: createArrayListState(initialValues),
        linkedListState: createLinkedListState(initialValues),
      });
    } else {
      steps.push({
        description: `[Sucesso] Busca concluída! O valor '${searchVal}' está no índice ${foundIndex}. ArrayList e LinkedList executaram buscas lineares O(N) para varrer as posições.`,
        arrayListState: createArrayListState(initialValues, [foundIndex]),
        linkedListState: createLinkedListState(initialValues, [`node-${searchVal}-${foundIndex}`]),
      });
    }
  }

  // 8. ACESSO POR ÍNDICE
  else if (operation.type === 'access') {
    const targetIdx = operation.index !== undefined ? operation.index : 2;
    const clampedIdx = Math.max(0, Math.min(initialValues.length - 1, targetIdx));

    if (initialValues.length === 0) {
      steps.push({
        description: 'Lista vazia. Não há itens para acessar.',
        arrayListState: createArrayListState([]),
        linkedListState: createLinkedListState([]),
      });
    } else {
      const val = initialValues[clampedIdx];
      const nodeId = `node-${val}-${clampedIdx}`;

      steps.push({
        description: `Queremos acessar o elemento no índice ${clampedIdx}. Veja a diferença radical de acesso:`,
        arrayListState: createArrayListState(initialValues),
        linkedListState: createLinkedListState(initialValues),
      });

      // ArrayList faz acesso O(1) instantâneo
      steps.push({
        description: `[ArrayList] Utilizando a fórmula de offset (endereço_base + índice * tamanho_bloco), a CPU calcula de imediato a posição física e lê o índice ${clampedIdx} ('${val}') em tempo constante O(1).`,
        arrayListState: createArrayListState(initialValues, [clampedIdx]),
        linkedListState: createLinkedListState(initialValues),
      });

      // LinkedList precisa navegar até lá
      const traversalIds: string[] = [];
      for (let i = 0; i <= clampedIdx; i++) {
        const loopNodeId = `node-${initialValues[i]}-${i}`;
        traversalIds.push(loopNodeId);
        const nodeDesc = i === clampedIdx 
          ? `[LinkedList] Chegamos ao nó final desejado de índice ${clampedIdx}: '${val}'.` 
          : `[LinkedList] Navegando... Posição ${i}: '${initialValues[i]}'.`;

        steps.push({
          description: nodeDesc,
          arrayListState: createArrayListState(initialValues, [clampedIdx]),
          linkedListState: createLinkedListState(initialValues, [...traversalIds], undefined, {
            from: loopNodeId,
            to: i < clampedIdx ? `node-${initialValues[i + 1]}-${i + 1}` : null,
            label: 'access',
          }),
        });
      }

      steps.push({
        description: `[Concluído] O valor coletado é '${val}'. Para ArrayList o acesso foi direto O(1), enquanto a LinkedList levou O(${clampedIdx + 1}) passos de ponteiros (Custo O(N)).`,
        arrayListState: createArrayListState(initialValues, [clampedIdx]),
        linkedListState: createLinkedListState(initialValues, [nodeId]),
      });
    }
  }

  return steps;
}
