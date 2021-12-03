import Sugar from 'sugar'

interface XEnumProps {
  id: number
  name: string
  label?: string
  style?: string
  desc?: string
}

export abstract class XEnum {
  id: number
  name: string
  label: string
  style: string
  desc: string

  constructor(props: XEnumProps) {
    this.id = props.id
    this.name = props.name
    this.label = props.label || Sugar.String.capitalize(props.name)
    this.style = props.style || ''
    this.desc = props.desc || ''
  }
}

export class XNotificationLevel extends XEnum {
  static readonly NONE = new XNotificationLevel({ id: 0, name: 'none' })
  static readonly SUCCESS = new XNotificationLevel({ id: 1, name: 'success', style: 'success' })
  static readonly INFO = new XNotificationLevel({ id: 2, name: 'info', style: 'info' })
  static readonly NOTICE = new XNotificationLevel({ id: 3, name: 'notice', style: 'warning' })
  static readonly WARNING = new XNotificationLevel({ id: 4, name: 'warning', style: 'danger' })
  static readonly PRIMARY = new XNotificationLevel({ id: 5, name: 'primary', style: 'primary' })
  static readonly SECONDARY = new XNotificationLevel({ id: 6, name: 'secondary', style: 'secondary' })
}

export class XNotificationType extends XEnum {
  static readonly POST = new XNotificationType({ id: 0, name: 'message' })
  static readonly TASK = new XNotificationType({ id: 1, name: 'task' })
  static readonly REQUEST = new XNotificationType({ id: 2, name: 'request' })
}

export class XPostLevel extends XEnum {
  static readonly NONE = new XPostLevel({ id: 0, name: 'none' })
  static readonly SUCCESS = new XPostLevel({ id: 1, name: 'success', style: 'success' })
  static readonly INFO = new XPostLevel({ id: 2, name: 'info', style: 'info' })
  static readonly NOTICE = new XPostLevel({ id: 3, name: 'notice', style: 'warning' })
  static readonly WARNING = new XPostLevel({ id: 4, name: 'warning', style: 'danger' })
  static readonly PRIMARY = new XPostLevel({ id: 5, name: 'primary', style: 'primary' })
  static readonly SECONDARY = new XPostLevel({ id: 6, name: 'secondary', style: 'secondary' })
}

export class XPostType extends XEnum {
  static readonly MESSAGE = new XPostType({ id: 0, name: 'message' })
  static readonly EVENT = new XPostType({ id: 0, name: 'event' })
}

export class XRequestStatus extends XEnum {
  static readonly REQUESTED = new XRequestStatus({ id: 0, name: 'requested' })
  static readonly APPROVED = new XRequestStatus({ id: 1, name: 'approved' })
  static readonly REJECTED = new XRequestStatus({ id: 2, name: 'rejected' })
}

export class XSubscriptionLevel extends XEnum {
  static readonly NONE = new XRequestStatus({ id: 0, name: 'none' })
  static readonly FOLLOW = new XRequestStatus({ id: 1, name: 'follow' })
  static readonly NOTIFY = new XRequestStatus({ id: 2, name: 'notify' })
  static readonly EMAIL = new XRequestStatus({ id: 3, name: 'email' })
}
