type UserId = string;
type PropertyName = string;
type PropertyValue = string;

export interface TypingUsers {
  [userId: UserId]: {
    [property: PropertyName]: PropertyValue;
  };
}

export interface TypingUsersChat {
  [property: PropertyName]: PropertyValue;
}
