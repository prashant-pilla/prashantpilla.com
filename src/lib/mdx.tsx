import { MDXRemote, type MDXRemoteProps } from 'next-mdx-remote/rsc';
import type { ComponentPropsWithoutRef } from 'react';

/**
 * Server component that compiles and renders an MDX body at build time.
 * Usage (inside a server component / page):
 *
 *   const project = getProject(slug);
 *   <Mdx source={project.body} />
 *
 * `components` is the shared element map. Phase 2 can extend it (e.g. a
 * styled <Figure/>, <Callout/>, or code block) without touching callers.
 */

type Components = NonNullable<MDXRemoteProps['components']>;

const defaultComponents: Components = {
  a: (props: ComponentPropsWithoutRef<'a'>) => {
    const external = typeof props.href === 'string' && /^https?:\/\//.test(props.href);
    return (
      <a
        {...props}
        className="text-accent underline decoration-border underline-offset-4 hover:decoration-accent"
        {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
      />
    );
  },
};

export interface MdxProps {
  source: string;
  components?: Components;
}

export function Mdx({ source, components }: MdxProps) {
  return <MDXRemote source={source} components={{ ...defaultComponents, ...components }} />;
}
