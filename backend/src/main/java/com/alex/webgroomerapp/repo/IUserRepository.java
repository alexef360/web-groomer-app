package com.alex.webgroomerapp.repo;

import com.alex.webgroomerapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface IUserRepository extends JpaRepository<User, Long> {

    Optional<User> findByLogin(String login);
    boolean existsByLogin(String login);
}
