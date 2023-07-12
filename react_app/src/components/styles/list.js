/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import styled, { userSelect } from '@xstyled/styled-components';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import QuoteItem from './item';
import { grid } from './constants';
import Title from './title';
import { useSelector } from 'react-redux';

export const getBackgroundColor = (isDraggingOver, isDraggingFrom) => {
  if (isDraggingOver) {
    return '#FFEBE6';
  }
  if (isDraggingFrom) {
    return '#E6FCFF';
  }
  return '#EBECF0';
};

const Wrapper = styled.div`
  background-color: ${(props) => getBackgroundColor(props.isDraggingOver, props.isDraggingFrom)};
  display: flex;
  flex-direction: column;
  opacity: ${({ isDropDisabled }) => (isDropDisabled ? 0.5 : 'inherit')};
  padding: ${grid}px;
  border: ${grid}px;
  padding-bottom: 0;
  transition: background-color 0.2s ease, opacity 0.1s ease;
  user-select: none;
  width: 250px;
`;

const scrollContainerHeight = 250;

const DropZone = styled.div`
  /* stop the list collapsing when empty */
  min-height: ${scrollContainerHeight}px;
  /*
    not relying on the items for a margin-bottom
    as it will collapse when the list is empty
  */
  padding-bottom: ${grid}px;
`;

const ScrollContainer = styled.div`
  overflow-x: hidden;
  overflow-y: auto;
  max-height: ${scrollContainerHeight}px;
`;

/* stylelint-disable block-no-empty */
const Container = styled.div``;
/* stylelint-enable */

const InnerQuoteList = React.memo(function InnerQuoteList(props) {
    console.log(props)
    const filterApps = useSelector(state => state.app.filterApps);
    const checkFilter = (name) => {
      if (filterApps[name] === undefined) {
          return true;
      }
      return filterApps[name]['app_name'] && filterApps[name]['app_type'] && filterApps[name]['distracting'];
  }

  return props.apps.map((app, index) => (
     checkFilter(app.name) ?
    <Draggable key={app.name} draggableId={app.name} index={index}>
        {/* <h1>quote['name']</h1> */}
      {(dragProvided, dragSnapshot) => (
        <QuoteItem
          key={app.name}
          app={app}
          isDragging={dragSnapshot.isDragging}
          isGroupedOver={Boolean(dragSnapshot.combineTargetFor)}
          provided={dragProvided}
        />
      )}
    </Draggable>
    : null
    ));
});

function InnerList(props) {
  const { apps, dropProvided } = props;
  const title = props.title ? <Title>{props.title}</Title> : null;
    console.log(props)
  return (
    <Container>
      {title}
      <DropZone ref={dropProvided.innerRef}>
        <InnerQuoteList apps={apps} />
        {dropProvided.placeholder}
      </DropZone>
    </Container>
  );
}

export default function AppList(props) {
  const {
    ignoreContainerClipping,
    internalScroll,
    scrollContainerStyle,
    isDropDisabled,
    isCombineEnabled,
    listId = 'LIST',
    listType,
    style,
    apps,
    title,
    useClone,
  } = props;

  return (
    <Droppable
      droppableId={listId}
      type={listType}
      ignoreContainerClipping={ignoreContainerClipping}
      isDropDisabled={isDropDisabled}
      isCombineEnabled={isCombineEnabled}
      renderClone={
        useClone? (provided, snapshot, descriptor) => (
              <QuoteItem
                quote={apps[descriptor.source.index]}
                provided={provided}
                isDragging={snapshot.isDragging}
                isClone
              />
            )
          : null
      }
    >
      {(dropProvided, dropSnapshot) => (
        <Wrapper
          style={style}
          isDraggingOver={dropSnapshot.isDraggingOver}
          isDropDisabled={isDropDisabled}
          isDraggingFrom={Boolean(dropSnapshot.draggingFromThisWith)}
          {...dropProvided.droppableProps}
        >
          {internalScroll ? (
            <ScrollContainer style={scrollContainerStyle}>
              <InnerList apps={apps} title={title} dropProvided={dropProvided} />
            </ScrollContainer>
          ) : (
            <InnerList apps={apps} title={title} dropProvided={dropProvided} />
          )}
        </Wrapper>
      )}
    </Droppable>
  );
}
