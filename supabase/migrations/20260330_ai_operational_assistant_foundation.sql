CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.ai_assistant_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID,
  section TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_assistant_conversations_org_created
  ON public.ai_assistant_conversations (organization_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_assistant_conversations_thread_created
  ON public.ai_assistant_conversations (conversation_id, created_at DESC);

ALTER TABLE public.ai_assistant_conversations ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.ai_assistant_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  section TEXT,
  source_conversation_id UUID REFERENCES public.ai_assistant_conversations(id) ON DELETE SET NULL,
  created_by UUID,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  keywords TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  usage_count INTEGER NOT NULL DEFAULT 1,
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_assistant_memories_org_section
  ON public.ai_assistant_memories (organization_id, section, last_used_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_assistant_memories_org_created
  ON public.ai_assistant_memories (organization_id, created_at DESC);

ALTER TABLE public.ai_assistant_memories ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS ai_assistant_memories_updated_at ON public.ai_assistant_memories;
CREATE TRIGGER ai_assistant_memories_updated_at
  BEFORE UPDATE ON public.ai_assistant_memories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
