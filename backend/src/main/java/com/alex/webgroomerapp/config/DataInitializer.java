package com.alex.webgroomerapp.config;

import com.alex.webgroomerapp.model.Customer;
import com.alex.webgroomerapp.model.GroomerProfile;
import com.alex.webgroomerapp.model.Pet;
import com.alex.webgroomerapp.model.PriceListItem;
import com.alex.webgroomerapp.model.SalonSettings;
import com.alex.webgroomerapp.model.ServiceType;
import com.alex.webgroomerapp.model.TimeSlot;
import com.alex.webgroomerapp.model.User;
import com.alex.webgroomerapp.model.UserRole;
import com.alex.webgroomerapp.model.Visit;
import com.alex.webgroomerapp.model.VisitStatus;
import com.alex.webgroomerapp.repo.ICustomerRepository;
import com.alex.webgroomerapp.repo.IGroomerProfileRepository;
import com.alex.webgroomerapp.repo.IPetRepository;
import com.alex.webgroomerapp.repo.IPriceListItemRepository;
import com.alex.webgroomerapp.repo.ISalonSettingsRepository;
import com.alex.webgroomerapp.repo.IUserRepository;
import com.alex.webgroomerapp.repo.IVisitRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;


@Profile("dev")
@Component
public class DataInitializer implements ApplicationRunner {

    private final IUserRepository userRepository;
    private final IPriceListItemRepository priceListItemRepository;
    private final IGroomerProfileRepository groomerProfileRepository;
    private final ICustomerRepository customerRepository;
    private final IPetRepository petRepository;
    private final ISalonSettingsRepository salonSettingsRepository;
    private final IVisitRepository visitRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    public DataInitializer(
            IUserRepository userRepository,
            IPriceListItemRepository priceListItemRepository,
            IGroomerProfileRepository groomerProfileRepository,
            ICustomerRepository customerRepository,
            IPetRepository petRepository,
            ISalonSettingsRepository salonSettingsRepository,
            IVisitRepository visitRepository,
            PasswordEncoder passwordEncoder,
            JdbcTemplate jdbcTemplate
    ) {
        this.userRepository = userRepository;
        this.priceListItemRepository = priceListItemRepository;
        this.groomerProfileRepository = groomerProfileRepository;
        this.customerRepository = customerRepository;
        this.petRepository = petRepository;
        this.salonSettingsRepository = salonSettingsRepository;
        this.visitRepository = visitRepository;
        this.passwordEncoder = passwordEncoder;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        ensureVisitStatusConstraint();
        seedSalonSettings();
        seedUsersAndProfiles();
        seedPricing();
        seedTodayDemoVisits();
    }

    private void seedSalonSettings() {
        if (salonSettingsRepository.count() > 0) {
            return;
        }

        SalonSettings settings = new SalonSettings();
        settings.setSalonName("Paw Care Groomer");
        settings.setAddress("Warsaw, Poland");
        settings.setPhoneNumber("+48 123 456 789");
        settings.setEmail("hello@pawcare.pl");
        settings.setOpeningHours("Mon–Fri 9:00–18:00, Sat 10:00–15:00");
        salonSettingsRepository.save(settings);
    }

    private void seedUsersAndProfiles() {
        ensureUser("admin", "admin123", UserRole.ADMIN);

        User groomerUser = ensureUser("groomer", "groomer123", UserRole.GROOMER);
        if (groomerProfileRepository.findByActiveTrue().stream()
                .noneMatch(p -> p.getUser().getId() == groomerUser.getId())) {
            GroomerProfile profile = new GroomerProfile();
            profile.setDisplayName("Ola Nowak");
            profile.setActive(true);
            profile.setUser(groomerUser);
            groomerProfileRepository.save(profile);
        }

        User groomer2 = ensureUser("groomer2", "groomer123", UserRole.GROOMER);
        if (groomerProfileRepository.findByActiveTrue().stream()
                .noneMatch(p -> p.getUser().getId() == groomer2.getId())) {
            GroomerProfile profile = new GroomerProfile();
            profile.setDisplayName("Kasia Zielińska");
            profile.setActive(true);
            profile.setUser(groomer2);
            groomerProfileRepository.save(profile);
        }

        ensureUser("reception", "reception123", UserRole.RECEPTION);

        User owner = ensureUser("anna@example.com", "owner123", UserRole.PET_OWNER);
        if (customerRepository.findByUserId(owner.getId()).isEmpty()) {
            Customer customer = new Customer();
            customer.setFirstName("Anna");
            customer.setLastName("Kowalska");
            customer.setEmail("anna@example.com");
            customer.setPhoneNumber("+48 123 456 789");
            customer.setUser(owner);
            customer = customerRepository.save(customer);

            Pet pet = new Pet();
            pet.setCustomer(customer);
            pet.setName("Milo");
            pet.setBreedText("Poodle");
            pet.setWeight(7.5);
            pet.setNotes("Calm, prefers soft music and gentle handling.");
            petRepository.save(pet);
        }
    }

    private void seedPricing() {
        boolean missingBreeds = priceListItemRepository.findAll().stream()
                .allMatch(i -> i.getBreedPrices() == null || i.getBreedPrices().isEmpty());

        if (priceListItemRepository.count() > 0 && !missingBreeds) {
            return;
        }

        priceListItemRepository.deleteAll();

        priceListItemRepository.save(fullGrooming());
        priceListItemRepository.save(spa());
        priceListItemRepository.save(firstVisit());
        priceListItemRepository.save(bathDry());
        priceListItemRepository.save(nailEar());
        priceListItemRepository.save(deshedding());
    }

    private PriceListItem fullGrooming() {
        PriceListItem item = base(
                "Full grooming",
                "Bath, breed-style or custom cut, ears, nails and finish.",
                "160",
                "450"
        );
        item.addBreedPrice("Yorkshire Terrier", bd("160"), bd("200"));
        item.addBreedPrice("Shih Tzu", bd("180"), bd("220"));
        item.addBreedPrice("Poodle (toy / mini)", bd("190"), bd("250"));
        item.addBreedPrice("Poodle (medium)", bd("240"), bd("350"));
        item.addBreedPrice("Golden Retriever", bd("250"), bd("320"));
        item.addBreedPrice("Large double coat", bd("300"), bd("450"));
        return item;
    }

    private PriceListItem spa() {
        PriceListItem item = base(
                "Spa & recovery",
                "Nourishing mask, coat care and gentle conditioning bath.",
                "120",
                "280"
        );
        item.addBreedPrice("Small breeds (to 8 kg)", bd("120"), bd("160"));
        item.addBreedPrice("Yorkshire / Maltese", bd("140"), bd("180"));
        item.addBreedPrice("Poodle (mini / medium)", bd("160"), bd("220"));
        item.addBreedPrice("Golden / Labrador", bd("180"), bd("250"));
        item.addBreedPrice("Large double coat", bd("220"), bd("280"));
        return item;
    }

    private PriceListItem firstVisit() {
        PriceListItem item = base(
                "First visit (puppies)",
                "Low-stress intro to tools, scents and touch — short session.",
                "80",
                "150"
        );
        item.addBreedPrice("Toy / mini puppy", bd("80"), bd("110"));
        item.addBreedPrice("Small breed puppy", bd("90"), bd("130"));
        item.addBreedPrice("Medium breed puppy", bd("110"), bd("150"));
        return item;
    }

    private PriceListItem bathDry() {
        PriceListItem item = base(
                "Bath & dry",
                "Gentle hypoallergenic wash and full dry — no full cut.",
                "100",
                "280"
        );
        item.addBreedPrice("Chihuahua / Pug", bd("100"), bd("140"));
        item.addBreedPrice("Yorkshire Terrier", bd("120"), bd("160"));
        item.addBreedPrice("Poodle (mini)", bd("140"), bd("180"));
        item.addBreedPrice("Golden Retriever", bd("180"), bd("240"));
        item.addBreedPrice("Husky / Shepherd", bd("220"), bd("280"));
        return item;
    }

    private PriceListItem nailEar() {
        PriceListItem item = base(
                "Nail & ear care",
                "Nail trim, paw tidy and ear cleaning.",
                "40",
                "80"
        );
        item.addBreedPrice("Small breeds", bd("40"), bd("55"));
        item.addBreedPrice("Medium breeds", bd("50"), bd("65"));
        item.addBreedPrice("Large breeds", bd("60"), bd("80"));
        return item;
    }

    private PriceListItem deshedding() {
        PriceListItem item = base(
                "Deshedding treatment",
                "Undercoat care for seasonal shedding — healthier coat, less hair at home.",
                "140",
                "350"
        );
        item.addBreedPrice("Corgi / Spitz", bd("140"), bd("190"));
        item.addBreedPrice("Labrador / Golden", bd("180"), bd("250"));
        item.addBreedPrice("German Shepherd", bd("220"), bd("300"));
        item.addBreedPrice("Husky / Samoyed", bd("260"), bd("350"));
        return item;
    }

    private User ensureUser(String login, String rawPassword, UserRole role) {
        return userRepository.findByLogin(login).orElseGet(() -> {
            User user = new User();
            user.setLogin(login);
            user.setPasswordHash(passwordEncoder.encode(rawPassword));
            user.setRole(role);
            user.setEnabled(true);
            return userRepository.save(user);
        });
    }

    private static PriceListItem base(String name, String description, String from, String to) {
        PriceListItem item = new PriceListItem();
        item.setName(name);
        item.setDescription(description);
        item.setIndicativePriceFrom(bd(from));
        item.setIndicativePriceTo(bd(to));
        item.setActive(true);
        return item;
    }

    private static BigDecimal bd(String value) {
        return new BigDecimal(value);
    }

    private void ensureVisitStatusConstraint() {
        try {
            jdbcTemplate.execute("ALTER TABLE visits DROP CONSTRAINT IF EXISTS visits_status_check");
            jdbcTemplate.execute("""
                ALTER TABLE visits ADD CONSTRAINT visits_status_check
                CHECK (status::text = ANY (ARRAY[
                    'PLANNED'::text, 'IN_PROGRESS'::text, 'READY'::text,
                    'COMPLETED'::text, 'CANCELLED'::text
                ]))
                """);
        } catch (Exception ignored) {
            // Non-Postgres or already compatible
        }
    }

    /** Demo floor traffic for "today" so Day schedule / Reception are not empty. */
    private void seedTodayDemoVisits() {
        LocalDate today = LocalDate.now();
        if (!visitRepository.findByDate(today).isEmpty()) {
            return;
        }

        List<GroomerProfile> groomers = groomerProfileRepository.findByActiveTrue();
        List<Pet> pets = petRepository.findAll();
        if (groomers.size() < 2 || pets.isEmpty()) {
            return;
        }

        GroomerProfile ola = groomers.stream()
                .filter(g -> "Ola Nowak".equals(g.getDisplayName()))
                .findFirst()
                .orElse(groomers.get(0));
        GroomerProfile kasia = groomers.stream()
                .filter(g -> g.getDisplayName() != null && g.getDisplayName().startsWith("Kasia"))
                .findFirst()
                .orElse(groomers.get(1));
        Pet milo = pets.get(0);

        visitRepository.save(demoVisit(today, TimeSlot.SLOT_10_00, ola, milo, ServiceType.FULL_GROOMING,
                VisitStatus.PLANNED, "Gentle face trim"));
        visitRepository.save(demoVisit(today, TimeSlot.SLOT_12_00, kasia, milo, ServiceType.BATH,
                VisitStatus.IN_PROGRESS, null));
        visitRepository.save(demoVisit(today, TimeSlot.SLOT_14_00, ola, milo, ServiceType.CUT,
                VisitStatus.PLANNED, null));
    }

    private static Visit demoVisit(
            LocalDate date,
            TimeSlot slot,
            GroomerProfile groomer,
            Pet pet,
            ServiceType service,
            VisitStatus status,
            String ownerExpectations
    ) {
        Visit visit = new Visit();
        visit.setDate(date);
        visit.setTimeSlot(slot);
        visit.setGroomer(groomer);
        visit.setPet(pet);
        visit.setServiceType(service);
        visit.setStatus(status);
        visit.setOwnerExpectations(ownerExpectations);
        return visit;
    }

}
