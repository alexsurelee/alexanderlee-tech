import type { AstroRenderer, ProjectAnnotations } from '@storybook-astro/framework';
import '../src/styles/global.css';

const preview: ProjectAnnotations<AstroRenderer> = {
	parameters: {
		layout: 'padded',
	},
};

export default preview;
