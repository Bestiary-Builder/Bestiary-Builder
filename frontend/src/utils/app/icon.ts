import { h } from 'vue'
import { Icon } from '@iconify/vue'

const iconifyAdapter = {
  component: (props: any) =>
    h(Icon, {
      icon: props.icon,
      style: {
        width: '1em',
        height: '1em',
        margin: "auto 0",
      },
    }),
}

export default iconifyAdapter