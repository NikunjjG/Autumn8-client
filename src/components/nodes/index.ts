import StartNode from './StartNode'
import EndNode from './EndNode'
import InputNode from './InputNode'
import LLMAgentNode from './LLMAgentNode'
import StructureNode from './StructureNode'
import CodeNode from './CodeNode'
import MCPToolNode from './MCPToolNode'
import HttpRequestNode from './HttpRequestNode'

export const nodeTypes = {
  start: StartNode,
  end: EndNode,
  input: InputNode,
  llm_agent: LLMAgentNode,
  structure: StructureNode,
  code: CodeNode,
  mcp_tool: MCPToolNode,
  http_request: HttpRequestNode,
}
