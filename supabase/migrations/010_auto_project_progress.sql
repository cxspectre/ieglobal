-- Auto-calculate project progress from milestones (completed / total * 100)
-- Removes manual progress_percentage maintenance

CREATE OR REPLACE FUNCTION update_project_progress_from_milestones()
RETURNS TRIGGER AS $$
DECLARE
  v_project_id UUID;
  v_completed INT;
  v_total INT;
  v_progress INT;
BEGIN
  -- Determine project_id (works for INSERT, UPDATE, DELETE)
  IF TG_OP = 'DELETE' THEN
    v_project_id := OLD.project_id;
  ELSE
    v_project_id := NEW.project_id;
  END IF;

  -- Count completed and total milestones for this project
  SELECT
    COUNT(*) FILTER (WHERE status = 'completed'),
    COUNT(*)
  INTO v_completed, v_total
  FROM milestones
  WHERE project_id = v_project_id;

  -- Calculate percentage (0 if no milestones)
  IF v_total = 0 THEN
    v_progress := 0;
  ELSE
    v_progress := ROUND((v_completed::DECIMAL / v_total) * 100);
  END IF;

  -- Cap at 100
  v_progress := LEAST(100, v_progress);

  UPDATE projects
  SET progress_percentage = v_progress
  WHERE id = v_project_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS trigger_update_project_progress ON milestones;

CREATE TRIGGER trigger_update_project_progress
  AFTER INSERT OR UPDATE OF status OR DELETE ON milestones
  FOR EACH ROW
  EXECUTE FUNCTION update_project_progress_from_milestones();

-- Backfill existing projects
UPDATE projects p
SET progress_percentage = COALESCE(
  (SELECT LEAST(100, ROUND((COUNT(*) FILTER (WHERE m.status = 'completed')::DECIMAL / NULLIF(COUNT(*), 0)) * 100))
   FROM milestones m WHERE m.project_id = p.id),
  0
);
