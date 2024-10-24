package thesistrack.ls1.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import thesistrack.ls1.entity.User;
import thesistrack.ls1.exception.request.ResourceNotFoundException;
import thesistrack.ls1.repository.UserRepository;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private User testUser;
    private UUID testUserId;

    @BeforeEach
    void setUp() {
        testUserId = UUID.randomUUID();

        testUser = new User();
        testUser.setId(testUserId);
    }

    @Test
    void getAll_WithNoFilters_ReturnsAllUsers() {
        List<User> users = Collections.singletonList(testUser);
        Page<User> expectedPage = new PageImpl<>(users);
        when(userRepository.searchUsers(
                isNull(),
                isNull(),
                any(PageRequest.class)
        )).thenReturn(expectedPage);

        Page<User> result = userService.getAll(
                null,
                null,
                0,
                10,
                "id",
                "asc"
        );

        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        verify(userRepository).searchUsers(
                isNull(),
                isNull(),
                any(PageRequest.class)
        );
    }

    @Test
    void getAll_WithSearchQueryAndGroups_ReturnsFilteredUsers() {
        String searchQuery = "test";
        String[] groups = {"group1", "group2"};
        List<User> users = Collections.singletonList(testUser);
        Page<User> expectedPage = new PageImpl<>(users);

        when(userRepository.searchUsers(
                eq(searchQuery.toLowerCase()),
                eq(new HashSet<>(Arrays.asList(groups))),
                any(PageRequest.class)
        )).thenReturn(expectedPage);

        Page<User> result = userService.getAll(
                searchQuery,
                groups,
                0,
                10,
                "id",
                "desc"
        );

        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        verify(userRepository).searchUsers(
                eq(searchQuery.toLowerCase()),
                eq(new HashSet<>(Arrays.asList(groups))),
                any(PageRequest.class)
        );
    }

    @Test
    void getAll_WithDescendingSort_UsesSortOrderCorrectly() {
        when(userRepository.searchUsers(
                any(),
                any(),
                argThat(pageRequest ->
                        pageRequest.getSort().getOrderFor("id").getDirection() == Sort.Direction.DESC
                )
        )).thenReturn(new PageImpl<>(Collections.emptyList()));

        userService.getAll(null, null, 0, 10, "id", "desc");

        verify(userRepository).searchUsers(
                any(),
                any(),
                argThat(pageRequest ->
                        pageRequest.getSort().getOrderFor("id").getDirection() == Sort.Direction.DESC
                )
        );
    }

    @Test
    void findById_WithExistingUser_ReturnsUser() {
        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));

        User result = userService.findById(testUserId);

        assertNotNull(result);
        assertEquals(testUserId, result.getId());
        verify(userRepository).findById(testUserId);
    }

    @Test
    void findById_WithNonExistingUser_ThrowsResourceNotFoundException() {
        when(userRepository.findById(testUserId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                userService.findById(testUserId)
        );
        verify(userRepository).findById(testUserId);
    }
}