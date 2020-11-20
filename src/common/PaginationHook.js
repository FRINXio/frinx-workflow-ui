import * as React from 'react';

const displayItem = (currentPage, maxPerPage, index) => {
  const currentPageStart = (currentPage - 1) * maxPerPage + 1;
  const currentPageEnd = currentPage * maxPerPage;

  if (index + 1 >= currentPageStart && index + 1 <= currentPageEnd) {
    return true;
  }

  return false;
};

export const usePagination = (itemList, maxItemsPerPage) => {
  const [items, setItems] = React.useState(itemList);
  const [currentPage, setCurrentPage] = React.useState(1);

  const isPaginating = items.length > maxItemsPerPage;
  const totalPages = Math.ceil(items.length / maxItemsPerPage);
  const itemCount = items.length;

  const pageItems = items.filter((val, index) => {
    if (!isPaginating) {
      return true;
    }

    if (!displayItem(currentPage, maxItemsPerPage, index)) {
      return false;
    }

    return true;
  });

  const setItemList = items => {
    setCurrentPage(1);
    setItems(items);
  };

  return {
    setItemList,
    isPaginating,
    currentPage,
    setCurrentPage,
    pageItems,
    totalPages,
    itemCount,
  };
};
