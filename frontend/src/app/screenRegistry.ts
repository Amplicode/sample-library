import BookList from "./books/BookList";
import GenreList from "./genres/GenreList";
import AuthorList from "./authors/AuthorList";
import { Home } from "./home/Home";
import { ReactComponent } from "@amplicode/react-core";

export interface ScreenInfo {
  /**
   * i18n key for menu item / tab caption
   */
  captionKey: string;
  /**
   * Component that will be rendered in a new tab when menu item is clicked
   */
  component: ReactComponent;
  props?: any;
}

export const screenRegistry: Record<string, ScreenInfo> = {
  // TODO: delete me
  // 'owner-list': {
  //   component: OwnerList,
  //   captionKey: 'screen.OwnerList',
  // },
  home: {
    component: Home,
    captionKey: "screen.home"
  },

  "author-list": {
    component: AuthorList,
    captionKey: "screen.AuthorList"
  },

  "genre-list": {
    component: GenreList,
    captionKey: "screen.GenreList"
  },

  "book-list": {
    component: BookList,
    captionKey: "screen.BookList"
  }
};

export function getScreenPaths(): string[] {
  return Object.keys(screenRegistry).map(k => "/" + k);
}
