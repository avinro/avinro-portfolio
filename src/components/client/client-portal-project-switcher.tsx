import { ChevronDownIcon } from "lucide-react";

interface Project {
  id: string;
  name: string;
  currentPhase: string;
}

interface ClientPortalProjectSwitcherProps {
  projects: Project[];
  activeProject: { id: string; name: string } | null;
}

/**
 * Read-only project switcher — v1.
 *
 * Renders a static label when only one project exists.
 * When multiple projects exist, renders a native <details>/<summary>
 * so the list is accessible and keyboard-operable with zero JS.
 *
 * No selection persistence yet — active project is always projects[0].
 * A future issue will add URL-param or cookie-based selection once
 * per-project nested routes ship.
 */
export function ClientPortalProjectSwitcher({
  projects,
  activeProject,
}: ClientPortalProjectSwitcherProps) {
  if (!activeProject) return null;

  if (projects.length <= 1) {
    return (
      <span className="text-foreground truncate text-sm font-semibold">{activeProject.name}</span>
    );
  }

  return (
    <details className="group relative">
      <summary className="text-foreground hover:text-foreground focus-visible:ring-ring flex cursor-pointer list-none items-center gap-1 truncate text-sm font-semibold focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none">
        <span className="truncate">{activeProject.name}</span>
        <ChevronDownIcon
          aria-hidden="true"
          className="text-muted-foreground size-3.5 shrink-0 group-open:rotate-180 motion-safe:transition-transform"
        />
      </summary>

      <ul className="bg-popover text-popover-foreground border-border absolute top-full left-0 z-30 mt-1 min-w-48 rounded-lg border py-1 shadow-md">
        {projects.map((project) => (
          <li key={project.id}>
            <span
              className={
                project.id === activeProject.id
                  ? "text-accent flex items-center px-3 py-2 text-sm font-medium"
                  : "text-foreground flex items-center px-3 py-2 text-sm"
              }
            >
              {project.name}
            </span>
          </li>
        ))}
      </ul>
    </details>
  );
}
