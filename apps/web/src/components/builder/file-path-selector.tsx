import React, { useState } from "react";
import { ChevronsRightIcon } from "lucide-react";
import {
  BreadcrumbItem,
  BreadcrumbSeparator,
} from "@repo/ui/components/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { type fileTreeStructure } from "@/shared/shared";
import { cn } from "@repo/ui/lib/utils";

type FilePathSelectorProps = {
  label: string;
  siblings: fileTreeStructure[];
  handleSelectFile: (file: fileTreeStructure) => void;
  showSeparator: boolean;
};

export function FilePathSelector({
  label,
  siblings,
  handleSelectFile,
  showSeparator,
}: FilePathSelectorProps) {
  const [open, setOpen] = useState(false);

  function RenderChildren({
    label,
    children,
  }: {
    label: string;
    children: fileTreeStructure[];
  }) {
    return (
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>{label}</DropdownMenuSubTrigger>
        <DropdownMenuPortal>
          <DropdownMenuSubContent>
            {children.map((child) => {
              if (child.type === "dir") {
                return (
                  <RenderChildren
                    label={child.label}
                    children={child.children ?? []}
                    key={child.label}
                  />
                );
              }

              return (
                <DropdownMenuItem
                  key={child.label}
                  onClick={() => handleSelectFile(child)}
                >
                  {child.label}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuSubContent>
        </DropdownMenuPortal>
      </DropdownMenuSub>
    );
  }

  return (
    <React.Fragment key={label}>
      <BreadcrumbItem className="flex items-center gap-2">
        <DropdownMenu onOpenChange={setOpen} open={open}>
          <DropdownMenuTrigger
            className={cn(
              "flex tems-center gap-1",
              siblings.length && "cursor-pointer",
            )}
            disabled={!siblings.length}
          >
            <span>{label}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {siblings?.map((sib) => {
              if (sib.type === "file") {
                return (
                  <DropdownMenuItem
                    onClick={() => handleSelectFile(sib)}
                    key={sib.label}
                  >
                    {sib.label}
                  </DropdownMenuItem>
                );
              }

              return (
                <RenderChildren
                  label={sib.label}
                  children={sib.children ?? []}
                  key={sib.label}
                />
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </BreadcrumbItem>

      {showSeparator && (
        <BreadcrumbSeparator>
          <ChevronsRightIcon />
        </BreadcrumbSeparator>
      )}
    </React.Fragment>
  );
}
