export type Id = string | number;

export type Project = {
  id: Id;
  name: string;
  color: string;
};

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
