export type Id = string | number;

export type Column = {
  id: Id;
  title: string;
};

export type CardItem = {
  id: Id;
  columnId: Id;
  title: string;
  details: string;
};
