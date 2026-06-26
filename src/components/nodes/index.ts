import StartNode from './StartNode'
import EndNode from './EndNode'
import InputNode from './InputNode'
import LLMAgentNode from './LLMAgentNode'
import StructureNode from './StructureNode'
import CodeNode from './CodeNode'
import HttpRequestNode from './HttpRequestNode'
import ConditionalNode from './ConditionalNode'
import ParallelNode from './ParallelNode'

export const nodeTypes = {
  start: StartNode,
  end: EndNode,
  input: InputNode,
  llm_agent: LLMAgentNode,
  structure: StructureNode,
  code: CodeNode,
  http_request: HttpRequestNode,
  conditional: ConditionalNode,
  parallel: ParallelNode,
}
